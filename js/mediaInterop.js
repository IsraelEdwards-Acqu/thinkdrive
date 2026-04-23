window.cameraInterop = {
    openCamera: async function (dotNetRef) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 1280 } },
                audio: true
            });

            const videoEl = document.createElement("video");
            videoEl.autoplay = true;
            videoEl.muted = true;
            videoEl.srcObject = stream;
            videoEl.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 12px;
        background-color: #000;
      `;

            const livePreview = document.querySelector(".live-preview");
            if (livePreview) {
                livePreview.innerHTML = "";
                livePreview.appendChild(videoEl);

                const badge = document.createElement("div");
                badge.innerText = "LIVE";
                badge.style.cssText = `
          position: absolute;
          top: 10px;
          left: 10px;
          background: red;
          color: white;
          font-weight: bold;
          padding: 4px 8px;
          border-radius: 6px;
        `;
                livePreview.appendChild(badge);
            }

            const recorder = new MediaRecorder(stream);
            let chunks = [];

            recorder.ondataavailable = e => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            recorder.onstop = async () => {
                const blob = new Blob(chunks, { type: "video/webm" });
                chunks = [];

                const reader = new FileReader();
                reader.onloadend = () => {
                    dotNetRef.invokeMethodAsync("OnCameraRecorded", reader.result);
                };
                reader.readAsDataURL(blob);

                // Stop all tracks to release camera
                stream.getTracks().forEach(track => track.stop());
            };

            window.cameraInterop._recorder = recorder;
            dotNetRef.invokeMethodAsync("OnCameraStarted");
        } catch (err) {
            console.error("Camera error:", err);
            alert("Unable to access camera: " + err.message);
        }
    },

    startRecording: function () {
        window.cameraInterop._recorder?.start();
    },

    stopRecording: function () {
        window.cameraInterop._recorder?.stop();
    }
};
window.mediaInterop = {
    addWatermark: function (watermarkText) {
        const preview = document.querySelector(".preview video, .preview img");
        if (!preview) return;

        const canvas = document.createElement("canvas");
        canvas.width = preview.videoWidth || preview.naturalWidth;
        canvas.height = preview.videoHeight || preview.naturalHeight;
        const ctx = canvas.getContext("2d");

        ctx.drawImage(preview, 0, 0, canvas.width, canvas.height);
        ctx.font = "24px Arial";
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.textAlign = "right";
        ctx.fillText(watermarkText, canvas.width - 20, canvas.height - 20);

        const previewContainer = document.querySelector(".preview");
        previewContainer.innerHTML = "";
        previewContainer.appendChild(canvas);
    },

    addWatermarkAndExport: async function (base64DataUrl, watermarkText, dotNetRef) {
        const video = document.createElement("video");
        video.src = base64DataUrl;
        video.muted = true;
        video.playsInline = true;
        await video.play();

        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");

        const stream = canvas.captureStream();
        const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
        let chunks = [];

        recorder.ondataavailable = e => {
            if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
            const blob = new Blob(chunks, { type: "video/webm" });
            const reader = new FileReader();
            reader.onloadend = () => {
                dotNetRef.invokeMethodAsync("OnWatermarkedReady", reader.result);
            };
            reader.readAsDataURL(blob);
        };

        recorder.start();

        const drawFrame = () => {
            if (video.ended || video.paused) return;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            ctx.font = "32px Arial";
            ctx.fillStyle = "rgba(255,255,255,0.7)";
            ctx.textAlign = "right";
            ctx.fillText(watermarkText, canvas.width - 20, canvas.height - 20);
            requestAnimationFrame(drawFrame);
        };

        drawFrame();

        video.onended = () => {
            recorder.stop();
        };
    }
};
