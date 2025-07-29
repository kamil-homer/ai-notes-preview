import { EditorContent, useEditor } from "@tiptap/react";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import StarterKit from "@tiptap/starter-kit";
import "./tiptap.css";
import { useNotesState } from "../../store/notes-state";
import { useEffect } from "react";
import { useParams } from "react-router";
import { useShallow } from "zustand/react/shallow";

const extensions = [StarterKit, Highlight, Typography];

export const Tiptap = () => {
  let { id } = useParams();

  const { notes, setCurrentNoteContent, setCurrentNotePlainText } =
    useNotesState(
      useShallow((state) => ({
        notes: state.notes,
        setCurrentNoteContent: state.setCurrentNoteContent,
        setCurrentNotePlainText: state.setCurrentNotePlainText,
      }))
    );

  const selectedNote = notes.find((note) => note.id == id);

  const editor = useEditor({
    extensions,
    content: "",
    editorProps: {
      attributes: {
        class: `wrapper`,
      },
    },
    onUpdate: ({ editor }) => {
      const content = editor.getJSON();
      const plaintext = editor.getText({ blockSeparator: "" });
      console.log(plaintext);
      setCurrentNoteContent(content);
      setCurrentNotePlainText(plaintext);
    },
  });

  useEffect(() => {
    console.log(selectedNote);
    // this is just an example. do whatever you want to do here
    // to retrieve your editors content from somewhere
    editor.commands.setContent(selectedNote?.content || "");
  }, [editor, id, selectedNote]);

  return <EditorContent editor={editor} />;
};
