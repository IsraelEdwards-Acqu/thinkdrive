/**
 * ThinkDrive — Video Trimmer Module
 * Auto-crops videos to maximum 50 seconds
 */
window.videoTrimmer = {
    /**
     * Trim video to maximum duration
     * @param {string} videoDataUrl - Base64 data URL of video
     * @param {number} maxDuration - Maximum duration in seconds (default 50)
     * @returns {Promise<string>} - Trimmed video data URL
     */
    async trimVideo(videoDataUrl, maxDuration = 50) {
        try {
            console.log('[VideoTrimmer] Starting trim process...');

            // Create video element
            const video = document.createElement('video');
            video.src = videoDataUrl;
            video.muted = true;
            video.playsInline = true;

            await new Promise((resolve) => {
                video.onloadedmetadata = resolve;
            });

            const videoDuration = video.duration;
            console.log(`[VideoTrimmer] Original duration: ${videoDuration.toFixed(2)}s`);

            // If video is already under max duration, return as-is
            if (videoDuration <= maxDuration) {
                console.log('[VideoTrimmer] Video within limit, no trim needed');
                return videoDataUrl;
            }

            // Setup canvas for recording
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');

            // Setup MediaRecorder
            const stream = canvas.captureStream(30); // 30 FPS
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9',
                videoBitsPerSecond: 2500000
            });

            const chunks = [];
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            return new Promise((resolve, reject) => {
                mediaRecorder.onstop = async () => {
                    const blob = new Blob(chunks, { type: 'video/webm' });
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        console.log('[VideoTrimmer] Trimmed successfully to 50 seconds');
                        resolve(reader.result);
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                };

                // Start recording
                mediaRecorder.start();
                video.play();

                // Draw frames
                const drawFrame = () => {
                    if (video.currentTime >= maxDuration || video.ended) {
                        mediaRecorder.stop();
                        video.pause();
                        return;
                    }
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    requestAnimationFrame(drawFrame);
                };

                drawFrame();

                // Auto-stop after max duration
                setTimeout(() => {
                    if (mediaRecorder.state === 'recording') {
                        mediaRecorder.stop();
                        video.pause();
                    }
                }, maxDuration * 1000);
            });
        } catch (error) {
            console.error('[VideoTrimmer] Error:', error);
            throw error;
        }
    },

    /**
     * Get video duration
     * @param {string} videoDataUrl - Video data URL
     * @returns {Promise<number>} - Duration in seconds
     */
    async getVideoDuration(videoDataUrl) {
        const video = document.createElement('video');
        video.src = videoDataUrl;
        video.muted = true;
        
        return new Promise((resolve) => {
            video.onloadedmetadata = () => {
                resolve(video.duration);
            };
        });
    },

    /**
     * Compress video
     * @param {string} videoDataUrl - Video data URL
     * @param {number} maxSizeMB - Maximum size in MB (default 100)
     * @returns {Promise<string>} - Compressed video data URL
     */
    async compressVideo(videoDataUrl, maxSizeMB = 100) {
        try {
            // Convert base64 to blob
            const response = await fetch(videoDataUrl);
            const blob = await response.blob();
            const sizeMB = blob.size / (1024 * 1024);

            console.log(`[VideoTrimmer] Video size: ${sizeMB.toFixed(2)}MB`);

            // If already under limit, return as-is
            if (sizeMB <= maxSizeMB) {
                return videoDataUrl;
            }

            // TODO: Implement compression algorithm
            console.warn('[VideoTrimmer] Compression needed but not implemented yet');
            return videoDataUrl;
        } catch (error) {
            console.error('[VideoTrimmer] Compression error:', error);
            return videoDataUrl;
        }
    }
};  