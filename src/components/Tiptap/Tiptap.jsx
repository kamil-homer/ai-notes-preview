import { EditorContent, useEditor } from "@tiptap/react";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import StarterKit from "@tiptap/starter-kit";
import "./tiptap.css";
import { useNotesState } from "../../store/notes-state";
import { useEffect } from "react";
import { useParams } from "react-router";

const extensions = [StarterKit, Highlight, Typography];

export const Tiptap = () => {
  let { id } = useParams();
  const zuNotes = useNotesState((state) => state.notes);
  const selectedNote = zuNotes.find((note) => note.id == id);

  const setCurrentNoteContent = useNotesState(
    (state) => state.setCurrentNoteContent
  );

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
      setCurrentNoteContent(content);
    },
  });

  useEffect(() => {
    // this is just an example. do whatever you want to do here
    // to retrieve your editors content from somewhere
    editor.commands.setContent(selectedNote?.content || "");
  }, [editor, id]);

  return <EditorContent editor={editor} />;
};
