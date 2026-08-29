import React, { useState, useRef, useEffect, useCallback } from "react";

const HANDLE_SIZE = 10;
const MIN_CROP_SIZE = 30;

const handles = [
  { id: "nw", cursor: "nwse-resize", x: -1, y: -1 },
  { id: "n", cursor: "ns-resize", x: 0, y: -1 },
  { id: "ne", cursor: "nesw-resize", x: 1, y: -1 },
  { id: "e", cursor: "ew-resize", x: 1, y: 0 },
  { id: "se", cursor: "nwse-resize", x: 1, y: 1 },
  { id: "s", cursor: "ns-resize", x: 0, y: 1 },
  { id: "sw", cursor: "nesw-resize", x: -1, y: 1 },
  { id: "w", cursor: "ew-resize", x: -1, y: 0 },
];

function ImageCropper({ src, onCropComplete, onCancel }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const containerRef = useRef(null);
  const previewCanvasRef = useRef(null);

  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropW, setCropW] = useState(200);
  const [cropH, setCropH] = useState(200);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartY, setDragStartY] = useState(0);
  const [activeHandle, setActiveHandle] = useState(null);
  const [initialCrop, setInitialCrop] = useState({ x: 0, y: 0, w: 200, h: 200 });
  const [imgLoaded, setImgLoaded] = useState(false);

  const drawImage = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !img.complete) return;

    const ctx = canvas.getContext("2d");
    const container = containerRef.current;
    if (!container) return;

    const containerW = container.clientWidth;
    const containerH = container.clientHeight;

    canvas.width = containerW;
    canvas.height = containerH;

    ctx.clearRect(0, 0, containerW, containerH);
    ctx.save();
    ctx.translate(containerW / 2, containerH / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);

    const imgAspect = img.naturalWidth / img.naturalHeight;
    let drawW, drawH;
    if (imgAspect > containerW / containerH) {
      drawW = containerW * 0.8;
      drawH = drawW / imgAspect;
    } else {
      drawH = containerH * 0.8;
      drawW = drawH * imgAspect;
    }

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }, [rotation, scale]);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      setImgLoaded(true);
    };
    img.src = src;
  }, [src]);

  useEffect(() => {
    if (!imgLoaded) return;
    drawImage();
  }, [imgLoaded, drawImage]);

  useEffect(() => {
    const handleResize = () => drawImage();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [drawImage]);

  useEffect(() => {
    if (!imgLoaded) return;
    const container = containerRef.current;
    if (!container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    const size = Math.min(w, h) * 0.5;
    setCropW(size);
    setCropH(size);
    setCropX((w - size) / 2);
    setCropY((h - size) / 2);
  }, [imgLoaded]);

  useEffect(() => {
    if (!imgLoaded) return;
    updatePreview();
  }, [cropX, cropY, cropW, cropH, rotation, scale, imgLoaded]);

  const updatePreview = () => {
    const previewCanvas = previewCanvasRef.current;
    const img = imgRef.current;
    if (!previewCanvas || !img || !img.complete) return;

    const ctx = previewCanvas.getContext("2d");
    const previewSize = 150;
    previewCanvas.width = previewSize;
    previewCanvas.height = previewSize;

    ctx.clearRect(0, 0, previewSize, previewSize);
    ctx.save();

    const container = containerRef.current;
    if (!container) return;
    const containerW = container.clientWidth;
    const containerH = container.clientHeight;

    const imgAspect = img.naturalWidth / img.naturalHeight;
    let drawW, drawH;
    if (imgAspect > containerW / containerH) {
      drawW = containerW * 0.8;
      drawH = drawW / imgAspect;
    } else {
      drawH = containerH * 0.8;
      drawW = drawH * imgAspect;
    }

    const imgCenterX = containerW / 2;
    const imgCenterY = containerH / 2;

    const relX = (cropX - imgCenterX + drawW / 2) / drawW;
    const relY = (cropY - imgCenterY + drawH / 2) / drawH;
    const relW = cropW / drawW;
    const relH = cropH / drawH;

    const sx = relX * img.naturalWidth;
    const sy = relY * img.naturalHeight;
    const sw = relW * img.naturalWidth;
    const sh = relH * img.naturalHeight;

    const cropAspect = cropW / cropH;
    let outW, outH;
    if (cropAspect > 1) {
      outW = previewSize;
      outH = previewSize / cropAspect;
    } else {
      outH = previewSize;
      outW = previewSize * cropAspect;
    }

    ctx.translate(previewSize / 2, previewSize / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(
      img,
      Math.max(0, sx),
      Math.max(0, sy),
      Math.min(sw, img.naturalWidth),
      Math.min(sh, img.naturalHeight),
      -outW / 2,
      -outH / 2,
      outW,
      outH
    );

    ctx.restore();
  };

  const handleMouseDown = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (
      x >= cropX &&
      x <= cropX + cropW &&
      y >= cropY &&
      y <= cropY + cropH
    ) {
      setIsDragging(true);
      setDragStartX(e.clientX - cropX);
      setDragStartY(e.clientY - cropY);
      e.preventDefault();
    }
  };

  const handleHandleMouseDown = (e, handle) => {
    e.stopPropagation();
    setIsResizing(true);
    setActiveHandle(handle);
    setDragStartX(e.clientX);
    setDragStartY(e.clientY);
    setInitialCrop({ x: cropX, y: cropY, w: cropW, h: cropH });
  };

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      if (isDragging) {
        const newX = e.clientX - dragStartX;
        const newY = e.clientY - dragStartY;
        const clampedX = Math.max(0, Math.min(newX, rect.width - cropW));
        const clampedY = Math.max(0, Math.min(newY, rect.height - cropH));
        setCropX(clampedX);
        setCropY(clampedY);
      }

      if (isResizing && activeHandle) {
        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;
        let { x, y, w, h } = initialCrop;

        const { id } = activeHandle;

        if (id.includes("e")) {
          w = Math.max(MIN_CROP_SIZE, w + dx);
        }
        if (id.includes("w")) {
          const newW = Math.max(MIN_CROP_SIZE, w - dx);
          x = x + (w - newW);
          w = newW;
        }
        if (id.includes("s")) {
          h = Math.max(MIN_CROP_SIZE, h + dy);
        }
        if (id.includes("n")) {
          const newH = Math.max(MIN_CROP_SIZE, h - dy);
          y = y + (h - newH);
          h = newH;
        }

        x = Math.max(0, x);
        y = Math.max(0, y);
        if (x + w > rect.width) w = rect.width - x;
        if (y + h > rect.height) h = rect.height - y;

        setCropX(x);
        setCropY(y);
        setCropW(w);
        setCropH(h);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setActiveHandle(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isDragging,
    isResizing,
    activeHandle,
    dragStartX,
    dragStartY,
    cropW,
    cropH,
    initialCrop,
  ]);

  const handleRotate = (degrees) => {
    setRotation((prev) => (prev + degrees + 360) % 360);
  };

  const handleZoom = (factor) => {
    setScale((prev) => Math.max(0.1, Math.min(5, prev * factor)));
  };

  const handleCrop = () => {
    const img = imgRef.current;
    const container = containerRef.current;
    if (!img || !container || !img.complete) return;

    const containerW = container.clientWidth;
    const containerH = container.clientHeight;

    const imgAspect = img.naturalWidth / img.naturalHeight;
    let drawW, drawH;
    if (imgAspect > containerW / containerH) {
      drawW = containerW * 0.8;
      drawH = drawW / imgAspect;
    } else {
      drawH = containerH * 0.8;
      drawW = drawH * imgAspect;
    }

    const imgCenterX = containerW / 2;
    const imgCenterY = containerH / 2;

    const relX = (cropX - imgCenterX + drawW / 2) / drawW;
    const relY = (cropY - imgCenterY + drawH / 2) / drawH;
    const relW = cropW / drawW;
    const relH = cropH / drawH;

    const sx = relX * img.naturalWidth;
    const sy = relY * img.naturalHeight;
    const sw = relW * img.naturalWidth;
    const sh = relH * img.naturalHeight;

    const outCanvas = document.createElement("canvas");
    const outSize = Math.max(cropW, cropH, 400);
    outCanvas.width = outSize;
    outCanvas.height = outSize;
    const ctx = outCanvas.getContext("2d");

    ctx.translate(outSize / 2, outSize / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    const cropAspect = cropW / cropH;
    let drawOutW, drawOutH;
    if (cropAspect > 1) {
      drawOutW = outSize;
      drawOutH = outSize / cropAspect;
    } else {
      drawOutH = outSize;
      drawOutW = outSize * cropAspect;
    }

    ctx.drawImage(
      img,
      Math.max(0, sx),
      Math.max(0, sy),
      Math.min(sw, img.naturalWidth),
      Math.min(sh, img.naturalHeight),
      -drawOutW / 2,
      -drawOutH / 2,
      drawOutW,
      drawOutH
    );

    const base64 = outCanvas.toDataURL("image/jpeg", 0.92);
    onCropComplete(base64);
  };

  const styles = {
    overlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(0, 0, 0, 0.75)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      backdropFilter: "blur(4px)",
    },
    modal: {
      background: "#1a1a2e",
      borderRadius: 16,
      padding: 24,
      width: "90vw",
      maxWidth: 900,
      maxHeight: "90vh",
      display: "flex",
      flexDirection: "column",
      boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
      border: "1px solid rgba(255,255,255,0.1)",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
      color: "#fff",
    },
    title: {
      fontSize: 20,
      fontWeight: 600,
      margin: 0,
    },
    body: {
      display: "flex",
      gap: 20,
      flex: 1,
      minHeight: 0,
      overflow: "hidden",
    },
    canvasContainer: {
      flex: 1,
      position: "relative",
      borderRadius: 12,
      overflow: "hidden",
      background: "#0f0f23",
      minHeight: 400,
      cursor: isDragging ? "grabbing" : "default",
    },
    canvas: {
      display: "block",
      width: "100%",
      height: "100%",
    },
    cropBox: {
      position: "absolute",
      left: cropX,
      top: cropY,
      width: cropW,
      height: cropH,
      border: "2px dashed #00d4ff",
      boxSizing: "border-box",
      cursor: isDragging ? "grabbing" : "grab",
      background: "rgba(0, 212, 255, 0.05)",
      pointerEvents: "auto",
    },
    cropOverlayTop: {
      position: "absolute",
      left: 0,
      top: 0,
      width: "100%",
      height: cropY,
      background: "rgba(0,0,0,0.5)",
      pointerEvents: "none",
    },
    cropOverlayBottom: {
      position: "absolute",
      left: 0,
      top: cropY + cropH,
      width: "100%",
      bottom: 0,
      background: "rgba(0,0,0,0.5)",
      pointerEvents: "none",
    },
    cropOverlayLeft: {
      position: "absolute",
      left: 0,
      top: cropY,
      width: cropX,
      height: cropH,
      background: "rgba(0,0,0,0.5)",
      pointerEvents: "none",
    },
    cropOverlayRight: {
      position: "absolute",
      left: cropX + cropW,
      top: cropY,
      width: `calc(100% - ${cropX + cropW}px)`,
      height: cropH,
      background: "rgba(0,0,0,0.5)",
      pointerEvents: "none",
    },
    sidebar: {
      width: 200,
      display: "flex",
      flexDirection: "column",
      gap: 16,
    },
    previewContainer: {
      background: "#0f0f23",
      borderRadius: 12,
      padding: 10,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    previewCanvas: {
      borderRadius: 8,
      maxWidth: "100%",
    },
    controls: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
    },
    controlGroup: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
    },
    label: {
      color: "#aaa",
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: 1,
      fontWeight: 600,
    },
    buttonRow: {
      display: "flex",
      gap: 8,
    },
    btn: {
      flex: 1,
      padding: "8px 0",
      border: "none",
      borderRadius: 8,
      fontSize: 14,
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.2s",
    },
    btnControl: {
      background: "#16213e",
      color: "#e0e0e0",
      border: "1px solid rgba(255,255,255,0.1)",
    },
    btnControlHover: {
      background: "#1a2744",
      borderColor: "rgba(0,212,255,0.3)",
    },
    btnCrop: {
      background: "linear-gradient(135deg, #00d4ff, #0090ff)",
      color: "#fff",
    },
    btnCancel: {
      background: "transparent",
      color: "#ff6b6b",
      border: "1px solid rgba(255,107,107,0.3)",
    },
    footer: {
      display: "flex",
      justifyContent: "flex-end",
      gap: 12,
      marginTop: 16,
    },
    info: {
      color: "#666",
      fontSize: 12,
      textAlign: "center",
      marginTop: 4,
    },
  };

  const [hoveredBtn, setHoveredBtn] = useState(null);

  const renderBtn = (style, label, onClick, key) => (
    <button
      key={key}
      style={{
        ...styles.btn,
        ...style,
        ...(hoveredBtn === key ? { transform: "scale(1.03)", opacity: 0.9 } : {}),
      }}
      onMouseEnter={() => setHoveredBtn(key)}
      onMouseLeave={() => setHoveredBtn(null)}
      onClick={onClick}
    >
      {label}
    </button>
  );

  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Crop Student Photo</h2>
        </div>

        <div style={styles.body}>
          <div
            ref={containerRef}
            style={styles.canvasContainer}
            onMouseDown={handleMouseDown}
          >
            <canvas ref={canvasRef} style={styles.canvas} />

            {imgLoaded && (
              <>
                <div style={styles.cropOverlayTop} />
                <div style={styles.cropOverlayBottom} />
                <div style={styles.cropOverlayLeft} />
                <div style={styles.cropOverlayRight} />

                <div style={styles.cropBox}>
                  {handles.map((h) => (
                    <div
                      key={h.id}
                      onMouseDown={(e) => handleHandleMouseDown(e, h)}
                      style={{
                        position: "absolute",
                        width: HANDLE_SIZE,
                        height: HANDLE_SIZE,
                        background: "#00d4ff",
                        border: "2px solid #fff",
                        borderRadius: "50%",
                        cursor: h.cursor,
                        left:
                          h.x === -1
                            ? -HANDLE_SIZE / 2
                            : h.x === 0
                            ? `calc(50% - ${HANDLE_SIZE / 2}px)`
                            : `calc(100% - ${HANDLE_SIZE / 2}px)`,
                        top:
                          h.y === -1
                            ? -HANDLE_SIZE / 2
                            : h.y === 0
                            ? `calc(50% - ${HANDLE_SIZE / 2}px)`
                            : `calc(100% - ${HANDLE_SIZE / 2}px)`,
                        zIndex: 10,
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <div style={styles.sidebar}>
            <div style={styles.previewContainer}>
              <canvas
                ref={previewCanvasRef}
                style={styles.previewCanvas}
                width={150}
                height={150}
              />
            </div>

            <div style={styles.controls}>
              <div style={styles.controlGroup}>
                <span style={styles.label}>Rotate</span>
                <div style={styles.buttonRow}>
                  {renderBtn(
                    styles.btnControl,
                    "\u21BB 90\u00B0",
                    () => handleRotate(90),
                    "rotL"
                  )}
                  {renderBtn(
                    styles.btnControl,
                    "\u21BA 90\u00B0",
                    () => handleRotate(-90),
                    "rotR"
                  )}
                </div>
              </div>

              <div style={styles.controlGroup}>
                <span style={styles.label}>Zoom</span>
                <div style={styles.buttonRow}>
                  {renderBtn(
                    styles.btnControl,
                    "\u2212",
                    () => handleZoom(0.9),
                    "zoomOut"
                  )}
                  {renderBtn(
                    styles.btnControl,
                    "+",
                    () => handleZoom(1.1),
                    "zoomIn"
                  )}
                  {renderBtn(
                    styles.btnControl,
                    "Reset",
                    () => {
                      setScale(1);
                      setRotation(0);
                    },
                    "zoomReset"
                  )}
                </div>
              </div>

              <div style={styles.info}>
                {Math.round(cropW)} &times; {Math.round(cropH)}px
                <br />
                Rotation: {rotation}&deg; | Zoom: {Math.round(scale * 100)}%
              </div>
            </div>
          </div>
        </div>

        <div style={styles.footer}>
          {renderBtn(styles.btnCancel, "Cancel", onCancel, "cancel")}
          {renderBtn(styles.btnCrop, "Crop & Save", handleCrop, "crop")}
        </div>
      </div>
    </div>
  );
}

export default ImageCropper;
