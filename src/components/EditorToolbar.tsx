import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setComment } from '../store/editorSlice';
import { Button, Row, Col, Input, Slider } from 'antd';
import { BoldOutlined, CommentOutlined } from '@ant-design/icons';

interface EditorToolbarProps {
    quill: any;
    onFormatChange: (formatType: string, value: any) => void;
    onClosePopover: () => void;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({ quill, onFormatChange, onClosePopover }) => {
    const dispatch = useDispatch();
    const editorState = useSelector((state: RootState) => state.editor);
    const [isBold, setIsBold] = useState(false);
    const [sliderValue, setSliderValue] = useState<number>(0);
    const [currentComment, setCurrentComment] = useState<string>('');

    const addBold = () => {
        const newBoldState = !isBold;
        setIsBold(newBoldState);
        onFormatChange('bold', newBoldState);
    };

    const addComment = () => {
        onFormatChange('comment', currentComment);
        onClosePopover(); // Close the popup after adding the comment
    };

    const handleSliderChange = (value: number) => {
        setSliderValue(value);
        const hexColor = `rgba(255, 0, 0, ${value / 100})`;
        onFormatChange('background', hexColor);
    };

    useEffect(() => {
        if (quill) {
            const currentFormat = quill.getFormat();
            setIsBold(currentFormat.bold || false);
            if (currentFormat.background) {
                const rgbaMatch = currentFormat.background.match(/rgba\(255, 0, 0, ([0-1]?\.\d+|1)\)/);
                if (rgbaMatch) {
                    setSliderValue(Math.round(parseFloat(rgbaMatch[1]) * 100));
                } else {
                    setSliderValue(0);
                }
            }
            setCurrentComment(currentFormat.comment || '');
        }
    }, [quill]);

    return (
        <div className="editor-toolbar">
            <Row gutter={16}>
                <Col span={4}>
                    <Button
                        type={isBold ? 'primary' : 'default'}
                        icon={<BoldOutlined />}
                        onClick={addBold}
                    />
                </Col>
                <Col span={20}>
                    <Slider
                        min={0}
                        max={100}
                        onChange={handleSliderChange}
                        value={sliderValue}
                    />
                </Col>
                <Col span={14}>
                    <Input
                        value={currentComment}
                        onChange={(e) => setCurrentComment(e.target.value)}
                        placeholder="Add comment"
                        prefix={<CommentOutlined />}
                    />
                </Col>
                <Col span={10}>
                    <Button type="primary" onClick={addComment}>
                        Add Comment
                    </Button>
                </Col>
            </Row>
        </div>
    );
};

export default EditorToolbar;
