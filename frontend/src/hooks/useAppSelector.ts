import { useSelector, useDispatch, TypedUseSelectorHook } from 'react-redux';
import type { RootState } from '../store';

export const useAppDispatch = () => {
  const dispatch = useDispatch();
  return dispatch;
};

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
