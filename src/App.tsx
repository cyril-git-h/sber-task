import React, { useState } from "react";
import "./App.css";
import { ReactComponent as EditButton } from "./edit.svg";
import { ReactComponent as CheckMark } from "./checkmark.svg";
import { ReactComponent as AddButton } from "./add.svg";
import marked from "marked";
import DOMPurify from "dompurify";

function Note({
  setNote,
}: {
  setNote: (
    value: React.SetStateAction<{
      target: HTMLElement;
      focus: string;
      distX: number;
      distY: number;
      isNote: boolean;
      right: number;
      bottom: number;
      parentElement: any;
    }>
  ) => void;
}) {
  type NoteI = {
    target: HTMLElement;
    focus: string;
    distX: number;
    distY: number;
    isNote: boolean;
    right: number;
    bottom: number;
    parentElement: any;
  };

  function getPoint(e: React.MouseEvent<HTMLElement>) {
    let target = e.target as HTMLElement;
    let rect = target?.parentElement?.getBoundingClientRect();

    setNote((prev: NoteI) => ({
      ...prev,
      target: e.target as HTMLElement,
      parentElement: target?.parentElement,
      right: rect!.right,
      bottom: rect!.bottom,
    }));
  }

  let [edit, setEdit] = useState(false);
  let [input, setInput] = useState("");
  let [text, setText] = useState("");

  return (
    <div
      onMouseDown={(e) => {
        let target = e.target as HTMLElement;
        setNote((prev: NoteI) => ({
          ...prev,
          isNote: true,
          distX: Math.abs(target.offsetLeft - e.clientX),
          distY: Math.abs(target.offsetTop - e.clientY),
        }));
      }}
      className="note"
    >
      <div
        onMouseDown={(e) => {
          setNote((prev: NoteI) => ({
            ...prev,
            focus: "a",
          }));
          getPoint(e);
        }}
        className="a"
      ></div>
      <div
        onMouseDown={(e) => {
          setNote((prev: NoteI) => ({
            ...prev,
            focus: "b",
          }));
          getPoint(e);
        }}
        className="b"
      ></div>
      <div
        onMouseDown={(e) => {
          setNote((prev: NoteI) => ({
            ...prev,
            focus: "c",
          }));
          getPoint(e);
        }}
        className="c"
      ></div>
      <div
        onMouseDown={(e) => {
          setNote((prev: NoteI) => ({
            ...prev,
            focus: "d",
          }));
          getPoint(e);
        }}
        className="d"
      ></div>
      <CheckMark
        style={{ display: edit ? "block" : "none" }}
        onClick={() => {
          setEdit(false);
          let cleanInput = DOMPurify.sanitize(input, {
            USE_PROFILES: { html: false, svg: false, mathMl: false },
          });
          setText(cleanInput);
        }}
      />
      <EditButton
        style={{ display: edit ? "none" : "block" }}
        onClick={() => {
          setEdit(true);
        }}
      />
      <textarea
        style={{ display: edit ? "block" : "none" }}
        className="text-area"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Кликните два раза, чтобы ввести текст"
      ></textarea>
      <span
        onMouseDown={(e) => e.preventDefault()}
        style={{ display: edit ? "none" : "block" }}
        className="note-text"
        dangerouslySetInnerHTML={{ __html: marked(text) }}
      ></span>
    </div>
  );
}

function App() {
  const minWidth = 100;
  const minHeight = 100;

  const [note, setNote] = useState({
    target: null as unknown as HTMLElement,
    focus: "",
    distX: null as unknown as number,
    distY: null as unknown as number,
    isNote: false,
    right: null as unknown as number,
    bottom: null as unknown as number,
    parentElement: null as unknown as HTMLElement | null,
  });

  function leftPoint(e: React.MouseEvent<HTMLElement>) {
    if (note.right - e.clientX >= minWidth) {
      note.parentElement!.style.left = e.clientX + "px";
      note.parentElement!.style.width =
        note.right - note.parentElement!.offsetLeft + "px";
    }
  }
  function topPoint(e: React.MouseEvent<HTMLElement>) {
    if (note.bottom - e.clientY >= minHeight) {
      note.parentElement!.style.top = e.clientY + "px";
    }
    note.parentElement!.style.height =
      note.bottom - note.parentElement!.offsetTop + "px";
  }
  function rightPoint(e: React.MouseEvent<HTMLElement>) {
    if (e.clientX - note.parentElement!.offsetLeft >= minWidth) {
      note.parentElement!.style.width =
        e.clientX - note.parentElement!.offsetLeft + "px";
    }
  }
  function bottomPoint(e: React.MouseEvent<HTMLElement>) {
    if (e.clientY - note.parentElement!.offsetTop >= minHeight) {
      note.parentElement!.style.height =
        e.clientY - note.parentElement!.offsetTop + "px";
    }
  }

  return (
    <div className="App">
      <div
        style={{ height: "100vh", width: "100vw" }}
        onMouseDown={(e) => {
          Array.from(document.querySelectorAll(".note")).forEach((el) => {
            let item = el as HTMLElement;
            item.style.zIndex = "0";
          });
          let target = e.target as HTMLElement;
          if (target.className === "note") {
            target.style.zIndex = "1000";
          } else if (target.parentElement?.className === "note") {
            target.parentElement.style.zIndex = "1000";
          }
        }}
        onMouseMove={(e) => {
          e.preventDefault();
          if (note.parentElement) {
            switch (note.focus) {
              case "a":
                topPoint(e);
                leftPoint(e);
                break;
              case "b":
                topPoint(e);
                rightPoint(e);
                break;
              case "c":
                bottomPoint(e);
                leftPoint(e);
                break;
              case "d":
                bottomPoint(e);
                rightPoint(e);
                break;
            }
            return;
          }
          setNote((prev) => ({
            ...prev,
            target: e.target as HTMLElement,
          }));
          if (note.isNote) {
            note.target.style.left = `${e.clientX - note.distX}px`;
            note.target.style.top = `${e.clientY - note.distY}px`;
          }
        }}
        onMouseUp={() => {
          setNote((prev) => ({
            ...prev,
            isNote: false,
            parentElement: null,
          }));
        }}
      >
        <AddButton />
        <Note setNote={setNote} />
        <Note setNote={setNote} />
      </div>
    </div>
  );
}

export default App;
