const youtubeLinkInput = document.getElementById('youtubeLink');
        const playButton = document.getElementById('playButton');
        const playPauseButton = document.getElementById('playPauseButton');
        const volumeSlider = document.getElementById('volumeSlider');
        const seekSlider = document.getElementById('seekSlider');
        const currentTime = document.getElementById('currentTime');
        const remainingTime = document.getElementById('remainingTime');
        let isPlaying = false;
        let player; // Variable para almacenar el objeto del reproductor de YouTube
        const thumbnailImage = document.getElementById('thumbnailImage');
        const videoTitleElement = document.getElementById('videoTitle');
        const videoControls = document.getElementById('videoControls');
        const downloadButton = document.getElementById('downloadButton');

        playButton.addEventListener('click', () => {
            const link = youtubeLinkInput.value;
            const videoId = extractVideoId(link);
            if (videoId) {
                initializePlayer(videoId);
                videoControls.classList.remove('hidden'); // Quita la clase "hidden" para mostrar los controles de video
                videoControls.classList.add('slide-down'); // Agrega la clase "slide-down" para la animación
                setTimeout(() => {
                    videoControls.classList.remove('slide-down'); // Quita la clase "slide-down" después de la animación
                }, 500);
            }
        });

        playPauseButton.addEventListener('click', () => {
            isPlaying = !isPlaying;
            playPauseButton.textContent = isPlaying ? 'Pause' : 'Play';
            if (isPlaying) {
                playAudio();
            } else {
                pauseAudio();
            }
        });

        seekSlider.addEventListener('input', () => {
            const seekTime = (player.getDuration() / 100) * seekSlider.value;
            setCurrentTime(seekTime);
            seekVideo(seekTime);
        });

        volumeSlider.addEventListener('input', () => {
            const volume = volumeSlider.value;
            setVolume(volume);
        });

        downloadButton.addEventListener('click', async () => {
            const link = youtubeLinkInput.value;
            const videoId = extractVideoId(link);
            if (videoId) {
                const apiUrl = `https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`;
                const options = {
                    method: 'GET',
                    headers: {
                        'X-RapidAPI-Key': '11d09cbf7dmsh64e767b85e3d8e8p15df95jsnb7a93663300a',
                        'X-RapidAPI-Host': 'youtube-mp36.p.rapidapi.com'
                    }
                };
                try {
                    const response = await fetch(apiUrl, options);
                    const result = await response.json();
                    const DownloadLink = result.link; 
                    console.log(result);
                    console.log(DownloadLink);
                    window.open(DownloadLink, "_blank")
                } catch (error) {
                    console.error(error);
                }
            }
        });


        function extractVideoId(url) {
            const regex = /[?&]v=([^&#]+)/;
            const match = url.match(regex);
            return match ? match[1] : null;
        }

        function initializePlayer(videoId) {
            if (player) {
                player.destroy(); // Destruir el reproductor anterior
            }
            player = new YT.Player('player', {
                height: '0',
                width: '0',
                videoId: videoId,
                playerVars: {
                    'controls': 0,
                    'autoplay': 0,
                    'disablekb': 1
                },
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange
                }
            });
        }

        function onPlayerReady(event) {
            const thumbnailUrl = `https://img.youtube.com/vi/${player.getVideoData().video_id}/maxresdefault.jpg`;
            thumbnailImage.src = thumbnailUrl;
        
            const videoTitle = player.getVideoData().title;
            videoTitleElement.innerText = videoTitle;
        
            playAudio(); // Inicia la reproducción después de que el reproductor esté listo
        }
        

        function onPlayerStateChange(event) {
            if (event.data === YT.PlayerState.PAUSED) {
                isPlaying = false;
                playPauseButton.textContent = 'Play';
            } else if (event.data === YT.PlayerState.PLAYING) {
                isPlaying = true;
                playPauseButton.textContent = 'Pause';
            }
        }

        function playAudio() {
            if (player) {
                player.playVideo();
            }
        }

        function pauseAudio() {
            if (player) {
                player.pauseVideo();
            }
        }

        function setVolume(volume) {
            if (player) {
                player.setVolume(volume);
            }
        }

        function setCurrentTime(time) {
            if (player) {
                player.seekTo(time);
            }
        }

        function seekVideo(time) {
            if (player) {
                player.seekTo(time);
            }
        }

        function formatTime(time) {
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60);
            const formattedMinutes = String(minutes).padStart(2, '0');
            const formattedSeconds = String(seconds).padStart(2, '0');
            return `${formattedMinutes}:${formattedSeconds}`;
        }

        function updateProgress() {
            const currentTimeInSeconds = player.getCurrentTime();
            const duration = player.getDuration();
            const progress = (currentTimeInSeconds / duration) * 100;
            seekSlider.value = progress;
            currentTime.textContent = formatTime(currentTimeInSeconds);
            remainingTime.textContent = formatTime(duration - currentTimeInSeconds);
        }

        setInterval(updateProgress, 1000);