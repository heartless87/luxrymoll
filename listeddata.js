// listeddata.js
console.log("[listeddata] loaded");

const STORAGE_KEY = "luxuryProducts_v1";

window.receiveProductData = function (product) {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    data.push(product);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
};

window.getProducts = function () {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
};
