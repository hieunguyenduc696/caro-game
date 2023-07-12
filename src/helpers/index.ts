export const formatNumber = (num: number) =>
  parseFloat((Math.round(num * 100) / 100).toFixed(2));

export const getPrimitiveStorage = (name: string, defaultValue: unknown) => {
  const json = localStorage.getItem(name);

  if (json) {
    return JSON.parse(json);
  }

  return defaultValue;
};

export const handleClickExport = () => {
  let downloadLink = document.createElement("a");
  downloadLink.setAttribute("download", "CanvasAsImage.png");
  let canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
  let dataURL = canvas.toDataURL("image/png");
  let url = dataURL.replace(
    /^data:image\/png/,
    "data:application/octet-stream"
  );
  downloadLink.setAttribute("href", url);
  downloadLink.click();
};
