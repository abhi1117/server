import { configureStore } from "@reduxjs/toolkit";
import { superAdminReducer } from "./reducers/superAdminReducer";


export const store = configureStore({
    reducer: {
      superAdminReducer,
    },
  });