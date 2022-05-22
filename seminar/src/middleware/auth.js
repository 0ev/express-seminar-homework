const AccountModel = require("../models/account");

class AccountDB {
  static _inst_;
  static getInst = () => {
    if (!AccountDB._inst_) AccountDB._inst_ = new AccountDB();
    return AccountDB._inst_;
  };

  #total = 10000;

  constructor() {
    try {
      const newItem = new AccountModel({
        key: process.env.API_KEY,
        password: process.env.API_PASSWORD,
      });
      const res = newItem.save();
    } catch (e) {
      console.log(`[Account-DB] Insert Error: ${e}`);
    }
    console.log("[Account-DB] DB Init Completed");
  }

  authorize = async (credential, password) => {
    const res = await AccountModel.findOne(
      { key: credential, password: password },
      (err, doc) => {
        if (err) return false;
        if (doc) {
          return true;
        }
        return false;
      }
    ).clone();
    return res;
  };
}

const AccountDBInst = AccountDB.getInst();

const authMiddleware = async (req, res, next) => {
  const isOK = await AccountDBInst.authorize(
    req.body.credential,
    req.body.password
  );
  if (isOK) {
    console.log("[AUTH-MIDDLEWARE] Authorized User");
    next();
  } else {
    console.log("[AUTH-MIDDLEWARE] Not Authorized User");
    res.status(401).json({ error: "Not Authorized" });
  }
};

module.exports = authMiddleware;
