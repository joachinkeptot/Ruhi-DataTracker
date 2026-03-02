const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  app: require("electron").app,
});
