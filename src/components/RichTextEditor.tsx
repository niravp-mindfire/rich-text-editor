import React, { useRef, useEffect, useState } from "react";
import ReactQuill from "react-quill";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { togglePopover, updateTextAction } from "../store/editorSlice";
import { UndoOutlined, RedoOutlined } from "@ant-design/icons"; // Import undo and redo icons
import "react-quill/dist/quill.snow.css";
import "../assets/css/RichTextEditor.css"; // Ensure you update this file with styles
import EditorToolbar from "./EditorToolbar";

const modules = {
  toolbar: false,
  history: {
    delay: 1000,
    maxStack: 50,
    userOnly: true,
  },
};

const RichTextEditor: React.FC = () => {
  const dispatch = useDispatch();
  const editorState = useSelector((state: RootState) => state.editor);
  const quillRef = useRef<ReactQuill | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [currentSelection, setCurrentSelection] = useState<{
    start: number;
    end: number;
  } | null>(null);

  const applyFormatting = (editor: any) => {
    if (!editor || !currentSelection) return;
    const { start, end } = currentSelection;
    editorState.textActions.forEach((action) => {
      if (start >= action.start && end <= action.end) {
        if (action.bold !== undefined) {
          editor.format("bold", action.bold);
        }
        if (action.background) {
          editor.format("background", action.background);
        }
        if (action.comment) {
          editor.format("comment", action.comment);
        }
      }
    });
  };

  const handleSelectionChange = (range: any) => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;
  
    if (range && range.length > 0) {
      try {
        // Get the bounds of the selected text
        const bounds = editor.getBounds(range.index, range.length);
  
        // Get the bounding rectangle of the editor container (use root instead of container)
        const editorContainer = quillRef.current?.getEditor().root.getBoundingClientRect();
  
        // Ensure editorContainer is available and valid
        if (!editorContainer) return;
  
        // Calculate the popover position relative to the viewport
        const popoverTop = editorContainer.top + bounds.top + window.scrollY + bounds.height - 100; // 10px below the text
        const popoverLeft = editorContainer.left + bounds.left + window.scrollX;
  
        // Update popover position state
        setPopoverPosition({
          top: popoverTop,
          left: popoverLeft,
        });
  
        // Show the popover
        dispatch(togglePopover(true));
  
        // Store the selection start and end points
        setCurrentSelection({
          start: range.index,
          end: range.index + range.length,
        });
  
        // Get the formatting for the selected text
        const selectedFormat = editor.getFormat(range.index, range.length);
        if (Object.keys(selectedFormat).length === 0) {
          // reset formatting if necessary
        } else {
          const action = {
            start: range.index,
            end: range.index + range.length,
            bold: selectedFormat.bold || false,
            background: selectedFormat.background || '',
            comment: selectedFormat.comment || '',
          };
          dispatch(updateTextAction(action));
        }
      } catch (error) {
        console.error('Error getting bounds:', error);
      }
    }
  };
  

  const handleUndo = () => {
    const editor = quillRef.current?.getEditor();
    if (editor) {
      const history = editor.getModule("history");
      if (history) {
        history.undo();
      }
    }
  };

  const handleRedo = () => {
    const editor = quillRef.current?.getEditor();
    if (editor) {
      const history = editor.getModule("history");
      if (history) {
        history.redo();
      }
    }
  };

  useEffect(() => {
    const editor = quillRef.current?.getEditor();
    if (editor) {
      applyFormatting(editor);
    }
  }, [editorState.textActions]);

  const handleDocumentClick = (event: MouseEvent) => {
    const target = event.target as Element | null;
    if (editorState.showPopover && target && !target.closest(".popover")) {
      dispatch(togglePopover(false));
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleDocumentClick);
    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, [editorState.showPopover]);

  // ** Updated Layout: Avatar, Audio Controls, Editor **
  return (
    <div className="editor-layout">
      {/* Avatar Section */}
      <div className="avatar-section">
        <img src="/path-to-avatar.png" alt="Avatar" className="avatar" />
        <div className="audio-controls">
          <div className="pitch-control">
            <label>Pitch</label>
            <input type="number" defaultValue={1.0} />
          </div>
          <div className="volume-control">
            <label>Volume</label>
            <input type="number" defaultValue={1.0} />
          </div>
          <div className="rate-control">
            <label>Rate</label>
            <input type="number" defaultValue={1.0} />
          </div>
        </div>
      </div>

      {/* Editor Section */}
      <div className="editor-section">
        <div className="editor-toolbar">
          <button onClick={handleUndo} title="Undo">
            <UndoOutlined />
          </button>
          <button onClick={handleRedo} title="Redo">
            <RedoOutlined />
          </button>
        </div>

        <ReactQuill
          ref={quillRef}
          onChangeSelection={handleSelectionChange}
          theme="snow"
          modules={modules}
          placeholder="Write something..."
        />

        {editorState.showPopover && popoverPosition && (
          <div
            className="popover"
            style={{
              top: popoverPosition.top,
              left: popoverPosition.left,
              position: "absolute",
              zIndex: 10,
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              padding: "10px",
            }}
          >
            <EditorToolbar
              quill={quillRef.current?.getEditor()}
              onFormatChange={(formatType, value) => {
                if (currentSelection) {
                  const action = {
                    start: currentSelection.start,
                    end: currentSelection.end,
                    bold: formatType === "bold" ? value : undefined,
                    background: formatType === "background" ? value : undefined,
                    comment: formatType === "comment" ? value : undefined,
                  };
                  dispatch(updateTextAction(action));
                  applyFormatting(quillRef.current?.getEditor());
                }
              }}
              onClosePopover={() => dispatch(togglePopover(false))}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;
