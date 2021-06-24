import express from "express";
import cors from "cors";
import { addSession, getSession } from "./db.controller";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/save", async (req: any, res: any) => {
  let { snameInput, state } = req.body.data;

  try {
    if (!!snameInput) {
      await addSession(snameInput, JSON.stringify(state));
      return res.send("Сохранено");
    }
  } catch (e) {
    if (e.code === "23505") {
      res.send("Такое имя уже есть");
    }
    if (e.code === "28P01") {
      res.send("Отсутствует соединение с базой");
    }
  } finally {
  }
});

app.post("/api/restore", async (req: any, res: any) => {
  let { rnameInput } = req.body.data;
  try {
    if (!!rnameInput) {
      let returnedData = await getSession(rnameInput);
      if (!returnedData?.rows[0]?.data) {
        throw new TypeError("Такого пользователя нет");
      }
      let newData = returnedData?.rows[0]?.data;
      return res.send(JSON.parse(newData));
    }
  } catch (e) {
    if (e.code === "23505") {
      res.send("Такое имя уже есть");
    }
    if (e.code === "28P01") {
      res.send("Отсутствует соединение с базой");
    }
    return res.send(e.message);
  } finally {
  }
});

app.listen(5000, () => console.log("server listening"));
