exports.generateRandomSixDigitNumber = () => {
    const min = 100000;
    const max = 999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// utils/transactionCode.js
exports.generateTransactionCode = () => {
    const prefix = "TRX"; // or anything you want, like "INV", "ORD"
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // e.g. 20250421
    const random = Math.floor(100000 + Math.random() * 900000); // random 6-digit number
    return `${prefix}${date}${random}`;
};  