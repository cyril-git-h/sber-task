import React, { useCallback, useReducer, useState } from "react";
import "./App.css";
import { ReactComponent as EditButton } from "./edit.svg";
import { ReactComponent as CheckMark } from "./checkmark.svg";
import { ReactComponent as AddButton } from "./add.svg";
import { ReactComponent as DeleteButton } from "./delete.svg";
import marked from "marked";
import DOMPurify from "dompurify";
import { useLocalStorage } from "react-use";

function Note({
  setNote,
  text,
  id,
  dispatch,
  position,
}: {
  position: any;
  dispatch: any;
  text: string;
  id: number;
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

  return (
    <div
      style={{
        top: position?.top,
        left: position?.left,
      }}
      onMouseUp={(e) => {
        let target = e.target as HTMLElement;
        if (target.className === "note") {
          dispatch({
            type: "SET POSITION",
            payload: {
              id,
              top: target?.style?.top,
              left: target?.style?.left,
            },
          });
        }
      }}
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
        onClick={(e) => {
          setEdit(false);
          let cleanInput = DOMPurify.sanitize(input, {
            USE_PROFILES: { html: false, svg: false, mathMl: false },
          });

          dispatch({ type: "CHANGE", payload: { id, text: cleanInput } });
          setInput(cleanInput);

          let target = e.target as HTMLElement;
          let parent = target?.closest(".note") as HTMLElement;
          dispatch({
            type: "SET POSITION",
            payload: {
              id,
              top: parent?.style?.top,
              left: parent?.style?.left,
            },
          });
        }}
      />
      <EditButton
        style={{ display: edit ? "none" : "block" }}
        onClick={() => {
          setInput(text);
          setEdit(true);
        }}
      />
      <DeleteButton onClick={() => dispatch({ type: "DELETE", payload: id })} />
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
        dangerouslySetInnerHTML={{ __html: marked(text ?? "") }}
      ></span>
    </div>
  );
}

function App() {
  const minWidth = 100;
  const minHeight = 100;

  const initialState = [{ id: 1, text: "", position: {} }];
  const localStorageKey = "notesStorage";

  function reducer(state: any, action: any) {
    switch (action.type) {
      case "ADD":
        return [...state, { id: state.length + 1, text: "" }];
      case "CHANGE":
        return [
          ...state.filter((note: any) => note.id !== action.payload.id),
          { id: action.payload.id, text: action.payload.text },
        ];
      case "DELETE":
        return [...state.filter((note: any) => note.id !== action.payload)];
      case "SET POSITION":
        return [
          ...state.filter((note: any) => note.id !== action.payload.id),
          {
            id: action.payload.id,
            position: action.payload,
            text: state.find((note: any) => note.id === action.payload.id).text,
          },
        ];
      default:
        return state;
    }
  }

  const usePersistReducer = () => {
    const [savedState, saveState] = useLocalStorage(
      localStorageKey,
      initialState
    );
    const reducerLocalStorage = useCallback(
      (state, action) => {
        const newState = reducer(state, action);
        saveState(newState);
        return newState;
      },
      [saveState]
    );
    return useReducer(reducerLocalStorage, savedState);
  };

  const [state, dispatch] = usePersistReducer();

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
          setNote((prev: any) => ({
            ...prev,
            target: e.target as HTMLElement,
          }));
          if (note.isNote) {
            note.target.style.left = `${e.clientX - note.distX}px`;
            note.target.style.top = `${e.clientY - note.distY}px`;
          }
        }}
        onMouseUp={() => {
          setNote((prev: any) => ({
            ...prev,
            isNote: false,
            parentElement: null,
          }));
        }}
      >
        <AddButton onClick={() => dispatch({ type: "ADD" })} />
        {state.map((note: any) => (
          <Note
            key={note.id}
            id={note.id}
            dispatch={dispatch}
            position={note.position}
            text={note.text}
            setNote={setNote}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
