import React, { useRef, useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import { useDispatch, useSelector } from 'react-redux';
import { UndoOutlined, RedoOutlined } from '@ant-design/icons';
import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk'; // Import Azure SDK
import 'react-quill/dist/quill.snow.css';
import './assets/css/RichTextEditor.css'
import { Button } from 'antd';
import { RootState } from './store/store';
import { togglePopover, updateTextAction } from './store/editorSlice';
import EditorToolbar from './components/EditorToolbar';

const modules = {
    toolbar: false,
    history: {
        delay: 1000,
        maxStack: 50,
        userOnly: true,
    },
};

const MyApp: React.FC = () => {
    const dispatch = useDispatch();
    const editorState = useSelector((state: RootState) => state.editor);
    const quillRef = useRef<ReactQuill | null>(null);
    const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number } | null>(null);
    const [currentSelection, setCurrentSelection] = useState<{ start: number; end: number } | null>(null);

    // Azure Speech Config
    const convertTextToSpeech = () => {
        const editor = quillRef.current?.getEditor();
        if (!editor) return;

        const text = editor.getText();  // Get the editor's content as plain text

        // Azure Speech Service configuration
        const speechConfig = speechsdk.SpeechConfig.fromSubscription(
            'YOUR_AZURE_SPEECH_API_KEY',  // Replace with your Azure Speech API Key
            'YOUR_REGION'                 // Replace with your Azure region (e.g., 'eastus')
        );

        const audioConfig = speechsdk.AudioConfig.fromDefaultSpeakerOutput();
        const synthesizer = new speechsdk.SpeechSynthesizer(speechConfig, audioConfig);

        // SSML to control pitch, rate, and volume
        const ssml = `
          <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
            <prosody pitch="1.0" rate="1.0" volume="1.0">
              ${text}
            </prosody>
          </speak>`;

        synthesizer.speakSsmlAsync(
            ssml,
            (result) => {
                if (result.reason === speechsdk.ResultReason.SynthesizingAudioCompleted) {
                    console.log('Speech synthesis finished.');
                } else {
                    console.error('Speech synthesis failed:', result.errorDetails);
                }
                synthesizer.close();
            },
            (err) => {
                console.error('Error:', err);
                synthesizer.close();
            }
        );
    };

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
                    top: bounds.top + window.scrollY + 60,
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

    const handleUndo = () => {
        const editor = quillRef.current?.getEditor();
        if (editor) {
            const history = editor.getModule('history');
            if (history) {
                history.undo();
            }
        }
    };

    const handleRedo = () => {
        const editor = quillRef.current?.getEditor();
        if (editor) {
            const history = editor.getModule('history');
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

            <Button onClick={convertTextToSpeech} type="primary" style={{ marginTop: '10px' }}>
                Convert to Speech
            </Button>
        </div>
    );
};

export default MyApp;
