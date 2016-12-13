export default function renderHotSpots(canvas, hotSpots) {
  const canvHeight = canvas.height;
  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = '#ff0000';
  hotSpots.forEach((hotSpot) => {
    ctx.beginPath();
    ctx.arc(hotSpot.x, hotSpot.y, hotSpot.radius, 0, 2 * Math.PI);
    ctx.stroke();
  });
}
