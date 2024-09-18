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
                existingAction.bold = action.payload.bold;
                existingAction.background = action.payload.background;
                existingAction.comment = action.payload.comment;
            } else {
                state.textActions.push(action.payload);
            }
        },
        resetFormatting: (state) => {
            state.textActions = [];
        },
    },
});

export const {
    setSliderValue,
    setComment,
    togglePopover,
    updateTextAction,
    resetFormatting,
} = editorSlice.actions;

export default editorSlice.reducer;
