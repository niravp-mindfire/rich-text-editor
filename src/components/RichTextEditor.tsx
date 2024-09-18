import React, { useRef, useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { togglePopover, updateTextAction } from '../store/editorSlice';
import 'react-quill/dist/quill.snow.css';
import '../assets/css/RichTextEditor.css';
import EditorToolbar from './EditorToolbar';

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
    const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number } | null>(null);
    const [currentSelection, setCurrentSelection] = useState<{ start: number; end: number } | null>(null);

    const applyFormatting = (editor: any) => {
        if (!editor || !currentSelection) return;

        const { start, end } = currentSelection;

        editorState.textActions.forEach(action => {
            if (start >= action.start && end <= action.end) {
                if (action.bold !== undefined) {
                    editor.format('bold', action.bold);
                }
                if (action.background) {
                    editor.format('background', action.background);
                }
                if (action.comment) {
                    editor.format('comment', action.comment);
                }
            }
        });
    };

    const handleSelectionChange = (range: any) => {
        const editor = quillRef.current?.getEditor();
        if (!editor) return;

        if (range && range.length > 0) {
            try {
                const bounds = editor.getBounds(range);
                setPopoverPosition({
                    top: bounds.top + window.scrollY + 40,
                    left: bounds.left + window.scrollX,
                });
                dispatch(togglePopover(true));
                setCurrentSelection({ start: range.index, end: range.index + range.length });

                const selectedFormat = editor.getFormat(range.index, range.length);
                if (Object.keys(selectedFormat).length === 0) {
                    // dispatch(resetFormatting());
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

    useEffect(() => {
        const editor = quillRef.current?.getEditor();
        if (editor) {
            // Ensure all actions are applied on render
            applyFormatting(editor);
        }
    }, [editorState.textActions]);

    const handleDocumentClick = (event: MouseEvent) => {
        const target = event.target as Element | null;
        if (editorState.showPopover && target && !target.closest('.popover')) {
            dispatch(togglePopover(false));
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleDocumentClick);
        return () => {
            document.removeEventListener('mousedown', handleDocumentClick);
        };
    }, [editorState.showPopover]);

    return (
        <div className="editor-container">
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
                        position: 'absolute',
                        zIndex: 10,
                        backgroundColor: '#fff',
                        border: '1px solid #ccc',
                        padding: '10px',
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <EditorToolbar
                        quill={quillRef.current?.getEditor()}
                        onFormatChange={(formatType, value) => {
                            if (currentSelection) {
                                const action = {
                                    start: currentSelection.start,
                                    end: currentSelection.end,
                                    bold: formatType === 'bold' ? value : undefined,
                                    background: formatType === 'background' ? value : undefined,
                                    comment: formatType === 'comment' ? value : undefined,
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
    );
};

export default RichTextEditor;
