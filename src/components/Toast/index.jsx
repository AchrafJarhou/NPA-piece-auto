import "./index.scss";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { hideToast } from "../../slices/toastSlice";
import { sanitizeHtml } from "../../utils/sanitizeHtml";

export default function Toast() {
  const dispatch = useDispatch();
  const message = useSelector((state) => state.toast.message);

  useEffect(() => {
    if (!message) return;
    const timeout = setTimeout(() => dispatch(hideToast()), 3000);
    return () => clearTimeout(timeout);
  }, [message, dispatch]);

  if (!message) return null;

  return (
    <div className="toast">
      {<p dangerouslySetInnerHTML={{ __html: sanitizeHtml(message) }} />}
    </div>
  );
}
