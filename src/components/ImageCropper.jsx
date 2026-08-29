import React, { useState, useRef, useEffect } from 'react';
import { Crop, X, Check, RotateCcw, RotateCw } from 'lucide-react';

export default function ImageCropper({ imageSrc, onCropComplete, onCancel }) {
  const [currentImageSrc, setCurrentImageSrc] = useState(imageSrc);
  const [crop, setCrop] = useState({ x: 50, y: 50, width: 150, height: 180 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState(null);
  
  const imgRef = useRef(null);
  const containerRef = useRef(null);

  // Reset currentImageSrc if imageSrc prop changes
  useEffect(() => {
    setCurrentImageSrc(imageSrc);
  }, [imageSrc]);

  // Keep crop inside boundaries
  const clampCrop = (c, imgWidth, imgHeight) => {
    const x = Math.max(0, Math.min(c.x, imgWidth - c.width));
    const y = Math.max(0, Math.min(c.y, imgHeight - c.height));
    const width = Math.max(50, Math.min(c.width, imgWidth - x));
    const height = Math.max(50, Math.min(c.height, imgHeight - y));
    return { x, y, width, height };
  };

  const handleMouseDown = (e) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check if mouse is on resize handle
    const handleSize = 12;
    const handles = {
      se: { x: crop.x + crop.width, y: crop.y + crop.height },
      sw: { x: crop.x, y: crop.y + crop.height },
      ne: { x: crop.x + crop.width, y: crop.y },
      nw: { x: crop.x, y: crop.y }
    };

    for (const [key, pos] of Object.entries(handles)) {
      if (Math.abs(mouseX - pos.x) < handleSize && Math.abs(mouseY - pos.y) < handleSize) {
        setIsResizing(true);
        setResizeHandle(key);
        return;
      }
    }

    // Check if mouse is inside the crop box
    if (
      mouseX >= crop.x &&
      mouseX <= crop.x + crop.width &&
      mouseY >= crop.y &&
      mouseY <= crop.y + crop.height
    ) {
      setIsDragging(true);
      setDragOffset({ x: mouseX - crop.x, y: mouseY - crop.y });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging && !isResizing) return;
    if (!imgRef.current) return;
    
    const rect = imgRef.current.getBoundingClientRect();
    const mouseX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const mouseY = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

    if (isDragging) {
      const nextCrop = {
        ...crop,
        x: mouseX - dragOffset.x,
        y: mouseY - dragOffset.y
      };
      setCrop(clampCrop(nextCrop, rect.width, rect.height));
    } else if (isResizing) {
      let nextCrop = { ...crop };
      
      if (resizeHandle === 'se') {
        nextCrop.width = mouseX - crop.x;
        nextCrop.height = mouseY - crop.y;
      } else if (resizeHandle === 'sw') {
        const deltaX = crop.x - mouseX;
        nextCrop.x = mouseX;
        nextCrop.width = crop.width + deltaX;
        nextCrop.height = mouseY - crop.y;
      } else if (resizeHandle === 'ne') {
        const deltaY = crop.y - mouseY;
        nextCrop.y = mouseY;
        nextCrop.width = mouseX - crop.x;
        nextCrop.height = crop.height + deltaY;
      } else if (resizeHandle === 'nw') {
        const deltaX = crop.x - mouseX;
        const deltaY = crop.y - mouseY;
        nextCrop.x = mouseX;
        nextCrop.y = mouseY;
        nextCrop.width = crop.width + deltaX;
        nextCrop.height = crop.height + deltaY;
      }

      setCrop(clampCrop(nextCrop, rect.width, rect.height));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  };

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDragging, isResizing, dragOffset, resizeHandle, crop]);

  // Rotate image by 90 degrees CCW or CW using temporary canvas
  const rotateImage = (direction) => {
    if (!imgRef.current) return;
    const originalImg = imgRef.current;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const w = originalImg.naturalWidth;
    const h = originalImg.naturalHeight;
    
    // Swap width and height for 90 degree rotation
    canvas.width = h;
    canvas.height = w;
    
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((direction === 'left' ? -90 : 90) * Math.PI / 180);
    ctx.drawImage(originalImg, -w / 2, -h / 2);
    
    const rotatedBase64 = canvas.toDataURL('image/jpeg');
    setCurrentImageSrc(rotatedBase64);
  };

  const performCrop = () => {
    if (!imgRef.current) return;
    
    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    
    // Get scaling factors between displayed image size and natural image size
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );
    
    const base64Image = canvas.toDataURL('image/jpeg');
    onCropComplete(base64Image);
  };

  return (
    <div className="cropper-modal-overlay">
      <div className="cropper-container glass-panel">
        <h3 className="form-label" style={{ marginBottom: 15, fontSize: 16 }}>Crop Student Photo</h3>
        
        <div 
          className="crop-area"
          ref={containerRef}
          onMouseDown={handleMouseDown}
        >
          <img 
            src={currentImageSrc} 
            alt="Source to crop" 
            className="crop-image" 
            ref={imgRef}
            onLoad={() => {
              if (imgRef.current) {
                // Initialize crop relative to image size
                const w = imgRef.current.width;
                const h = imgRef.current.height;
                setCrop({
                  x: w * 0.25,
                  y: h * 0.25,
                  width: w * 0.5,
                  height: h * 0.5
                });
              }
            }}
          />
          {imgRef.current && (
            <div 
              className="crop-selection-box"
              style={{
                left: crop.x + (containerRef.current ? imgRef.current.offsetLeft : 0),
                top: crop.y + (containerRef.current ? imgRef.current.offsetTop : 0),
                width: crop.width,
                height: crop.height
              }}
            >
              {/* Resize handles */}
              <div className="crop-handle crop-handle-nw" />
              <div className="crop-handle crop-handle-ne" />
              <div className="crop-handle crop-handle-sw" />
              <div className="crop-handle crop-handle-se" />
            </div>
          )}
        </div>

        {/* Rotation Tools row */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 20 }}>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => rotateImage('left')}>
            <RotateCcw size={14} style={{ marginRight: 6 }} /> Rotate -90°
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => rotateImage('right')}>
            <RotateCw size={14} style={{ marginRight: 6 }} /> Rotate +90°
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            <X size={16} /> Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={performCrop}>
            <Check size={16} /> Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
}
