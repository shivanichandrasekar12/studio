import * as functions from "firebase-functions";
import next from "next";
import path from "path";

const dev = process.env.NODE_ENV !== "production";

// Assumes the Next.js app is in the parent directory of the 'functions' folder
// __dirname will be 'functions/lib' after compilation, so '../..' goes to project root
const projectRoot = path.resolve(__dirname, "../.."); 

const app = next({
  dev,
  conf: { distDir: path.join(projectRoot, ".next") },
});

const handle = app.getRequestHandler();

export const nextServer = functions.region('us-central1').https.onRequest(async (req, res) => {
  try {
    await app.prepare();
    return handle(req, res);
  } catch (error) {
    console.error("Error handling request with Next.js:", error);
    res.status(500).send("Internal Server Error preparing Next.js app.");
  }
});
