import React, { useRef, useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { togglePopover } from '../store/editorSlice';
import { Row, Button } from 'antd';
import { UndoOutlined, RedoOutlined } from '@ant-design/icons';
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
    const popoverRef = useRef<HTMLDivElement | null>(null);
    const editorContainerRef = useRef<HTMLDivElement | null>(null);

    const handleSelectionChange = (range: any) => {
        const editor = quillRef.current?.getEditor();
        if (!editor) return;

        if (range && range.length > 0) {
            try {
                const bounds = editor.getBounds(range as any);
                setPopoverPosition({
                    top: bounds.top + window.scrollY,
                    left: bounds.left + window.scrollX
                });
                dispatch(togglePopover(true));
            } catch (error) {
                console.error('Error getting bounds:', error);
            }
        }
    };

    const undoChange = () => {
        const editor = quillRef.current?.getEditor();
        if (editor) {
            (editor as any).history.undo();
        }
    };

    const redoChange = () => {
        const editor = quillRef.current?.getEditor();
        if (editor) {
            (editor as any).history.redo();
        }
    };

    const handleDocumentClick = (event: MouseEvent) => {
        if (editorState.showPopover && popoverRef.current && editorContainerRef.current) {
            const popoverElement = popoverRef.current;
            const editorElement = editorContainerRef.current;
            if (popoverElement && !popoverElement.contains(event.target as Node) &&
                !editorElement.contains(event.target as Node)) {
                dispatch(togglePopover(false));
            }
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleDocumentClick);
        return () => {
            document.removeEventListener('mousedown', handleDocumentClick);
        };
    }, [editorState.showPopover]);

    return (
        <div className="editor-container" ref={editorContainerRef}>
            <ReactQuill
                ref={quillRef}
                onChangeSelection={handleSelectionChange}
                theme="snow"
                modules={modules}
                placeholder="Write something..."
            />
            <Row justify="center" className="toolbar">
                <Button onClick={undoChange} icon={<UndoOutlined />} />
                <Button onClick={redoChange} icon={<RedoOutlined />} />
            </Row>

            {editorState.showPopover && popoverPosition && (
                <div
                    className="popover"
                    ref={popoverRef}
                    style={{
                        top: popoverPosition.top,
                        left: popoverPosition.left,
                    }}
                >
                    <EditorToolbar quill={quillRef.current?.getEditor()} closePopover={() => dispatch(togglePopover(false))} />
                </div>
            )}
        </div>
    );
};

export default RichTextEditor;
