import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setComment, setSliderValue } from '../store/editorSlice';
import { Button, Row, Col, Slider, Input } from 'antd';
import { BoldOutlined, CommentOutlined } from '@ant-design/icons';

interface EditorToolbarProps {
    quill: any;
    closePopover: () => void;
    onFormatChange: (formatType: string, value: any) => void;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({ quill, closePopover, onFormatChange }) => {
    const dispatch = useDispatch();
    const { comment, sliderValue } = useSelector((state: RootState) => state.editor);

    const applyBold = () => {
        if (quill) {
            const isBold = quill.getFormat().bold;
            onFormatChange('bold', !isBold);
        } else {
            console.error('Quill editor instance not found');
        }
    };

    const handleRateChange = (value: number) => {
        dispatch(setSliderValue(value));
        if (quill) {
            onFormatChange('background', `rgba(255, 0, 0, ${value / 100})`);
        } else {
            console.error('Quill editor instance not found');
        }
    };

    const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setComment(e.target.value));
    };

    const addComment = () => {
        if (comment) {
            console.log(`Comment added: ${comment}`);
            closePopover();
        }
    };

    return (
        <div className="popover-content">
            <Button icon={<BoldOutlined />} onClick={applyBold}>Bold</Button>
            <Row align="middle" gutter={16} style={{ marginTop: 10 }}>
                <Col span={6}><span>Rate:</span></Col>
                <Col span={18}>
                    <Slider min={0} max={100} value={sliderValue} onChange={handleRateChange} />
                </Col>
            </Row>
            <Row align="middle" gutter={16} style={{ marginTop: 10 }}>
                <Col span={6}><span>Comment:</span></Col>
                <Col span={18}>
                    <Input
                        value={comment}
                        onChange={handleCommentChange}
                        onPressEnter={addComment}
                        placeholder="Add a comment"
                        prefix={<CommentOutlined />}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default EditorToolbar;
