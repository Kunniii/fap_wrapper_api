import express from "express";
import {
  checkSession,
  jsonifyHTMLData,
  makeRequest,
  all,
  any,
  massRequest,
  massJsonify,
} from "../utils.js";
const router = express.Router();

