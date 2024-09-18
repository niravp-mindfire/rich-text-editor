import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TextAction {
    start: number;
    end: number;
    bold: boolean;
    background: string;
}

interface EditorState {
    comment: string;
    sliderValue: number;
    showPopover: boolean;
    textActions: TextAction[];
}

const initialState: EditorState = {
    comment: '',
    sliderValue: 50,
    showPopover: false,
    textActions: [], // Initialize with an empty array
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
        addTextAction: (state, action: PayloadAction<TextAction>) => {
            state.textActions.push(action.payload);
        },
        updateTextAction: (state, action: PayloadAction<TextAction>) => {
            const { start, end, bold, background } = action.payload;
            const index = state.textActions.findIndex(
                (action) => action.start === start && action.end === end
            );
            if (index >= 0) {
                state.textActions[index] = { start, end, bold, background };
            } else {
                state.textActions.push({ start, end, bold, background });
            }
        },
    },
});

export const { setComment, setSliderValue, togglePopover, addTextAction, updateTextAction } = editorSlice.actions;
export default editorSlice.reducer;
