import {createSlice} from "@reduxjs/toolkit";

const initialState={
    superAdminRole:"",
    token:"",
    id:""
};

const superAdminSlice=createSlice({
    name:'superAdmin',
    initialState,
    reducers:{
        updateRole:(state,action)=>{
            console.log("role in redux during login:",action.payload)
            state.superAdminRole=action.payload
        },
        updateToken:(state,action)=>{
            console.log("token in redux during login:",action.payload)
            state.token=action.payload
        },
        updateId:(state,action)=>{
            console.log("id in redux during login:",action.payload)
            state.id=action.payload
        },
        logoutUser:(state,action)=>{
            console.log('Logging out in redux.....Setting state to null');
            state.superAdminRole="";
            state.token="";
            state.id="";
        }

    }
});

export const superAdminAction=superAdminSlice.actions;
export const superAdminReducer=superAdminSlice.reducer;
export const superAdminSelector=(state)=>state.superAdminReducer.superAdminRole;
export const userToken=(state)=>state.superAdminReducer.token;
export const userId=(state)=>state.superAdminReducer.id;
