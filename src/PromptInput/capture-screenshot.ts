/** Capture only after an explicit user gesture; the browser owns screen selection. */
export async function captureScreenshot(signal: AbortSignal): Promise<File> {
  if (!navigator.mediaDevices?.getDisplayMedia)
    throw new Error('Screen capture is not supported by this browser');
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: false,
  });
  const video = document.createElement('video');
  const stop = () => {
    for (const track of stream.getTracks()) track.stop();
  };
  signal.addEventListener('abort', stop, { once: true });
  video.muted = true;
  video.playsInline = true;
  try {
    signal.throwIfAborted();
    await new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        clearTimeout(timer);
        video.onloadedmetadata = null;
        video.onerror = null;
        signal.removeEventListener('abort', abort);
      };
      const abort = () => {
        cleanup();
        reject(new DOMException('Screen capture cancelled', 'AbortError'));
      };
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error('Screen capture timed out'));
      }, 10_000);
      video.onloadedmetadata = () => {
        cleanup();
        resolve();
      };
      video.onerror = () => {
        cleanup();
        reject(new Error('Failed to load screen stream'));
      };
      signal.addEventListener('abort', abort, { once: true });
      video.srcObject = stream;
    });
    await video.play();
    signal.throwIfAborted();
    if (!video.videoWidth || !video.videoHeight)
      throw new Error('Screen capture has no image');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Screen capture canvas is unavailable');
    context.drawImage(video, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/png'),
    );
    signal.throwIfAborted();
    if (!blob) throw new Error('Unable to encode screenshot');
    return new File([blob], `screenshot-${Date.now()}.png`, {
      type: 'image/png',
    });
  } finally {
    signal.removeEventListener('abort', stop);
    stop();
    video.pause();
    video.srcObject = null;
  }
}
