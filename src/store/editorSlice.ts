import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface EditorState {
    comment: string;
    sliderValue: number;
    showPopover: boolean;
}

const initialState: EditorState = {
    comment: '',
    sliderValue: 50,
    showPopover: false,
};

const editorSlice = createSlice({
    name: 'editor',
    initialState,
    reducers: {
        setComment: (state, action: PayloadAction<string>) => {
            state.comment = action.payload;
        },
        setSliderValue: (state, action: PayloadAction<number>) => {
            state.sliderValue = action.payload;
        },
        togglePopover: (state, action: PayloadAction<boolean>) => {
            state.showPopover = action.payload;
        },
    },
});

export const { setComment, setSliderValue, togglePopover } = editorSlice.actions;
export default editorSlice.reducer;
