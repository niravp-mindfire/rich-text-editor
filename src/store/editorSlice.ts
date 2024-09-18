import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TextAction {
    start: number;
    end: number;
    bold?: boolean;
    background?: string;
    comment?: string;
}

interface EditorState {
    textActions: TextAction[];
    sliderValue: number;
    comment: string;
    showPopover: boolean;
}

const initialState: EditorState = {
    textActions: [],
    sliderValue: 0,
    comment: '',
    showPopover: false,
};

const editorSlice = createSlice({
    name: 'editor',
    initialState,
    reducers: {
        setSliderValue: (state, action: PayloadAction<number>) => {
            state.sliderValue = action.payload;
        },
        setComment: (state, action: PayloadAction<string>) => {
            state.comment = action.payload;
        },
        togglePopover: (state, action: PayloadAction<boolean>) => {
            state.showPopover = action.payload;
        },
        updateTextAction: (state, action: PayloadAction<TextAction>) => {
            const { start, end } = action.payload;
            const existingAction = state.textActions.find(
                (action) => action.start === start && action.end === end
            );
            if (existingAction) {
                Object.assign(existingAction, action.payload);
            } else {
                state.textActions.push(action.payload);
            }
        },
    },
});

export const { setSliderValue, setComment, togglePopover, updateTextAction } = editorSlice.actions;
export default editorSlice.reducer;
