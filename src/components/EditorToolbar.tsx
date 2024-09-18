import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setComment, setSliderValue } from '../store/editorSlice';
import { Button, Row, Col, Slider, Input } from 'antd';
import { BoldOutlined, CommentOutlined } from '@ant-design/icons';

interface EditorToolbarProps {
    quill: any;
    closePopover: () => void;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({ quill, closePopover }) => {
    const dispatch = useDispatch();
    const { comment, sliderValue } = useSelector((state: RootState) => state.editor);

    const applyBold = () => {
        if (quill) {
            quill.format('bold', true);
        } else {
            console.error('Quill editor instance not found');
        }
    };

    const handleRateChange = (value: number) => {
        dispatch(setSliderValue(value));
        if (quill) {
            quill.format('background', `rgba(255, 0, 0, ${value / 100})`);
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
                        placeholder="Add a comment"
                        suffix={<CommentOutlined />}
                    />
                    <Button onClick={addComment} type="primary" block className='add-comment'>Add Comment</Button>
                </Col>
            </Row>
        </div>
    );
};

export default EditorToolbar;
