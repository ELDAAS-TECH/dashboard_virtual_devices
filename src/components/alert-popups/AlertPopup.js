import { Snackbar } from "@mui/material";
import MuiAlert from "@mui/material/Alert";

const AlertPopup = (props) => {
  return (
    <div>
      <Snackbar
        open={props.snackbarOpen}
        autoHideDuration={6000}
        onClose={props.handleSnackbarClose}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={props.handleSnackbarClose}
          severity={props.snackbarMessage.includes("Error") ? "error" : "success"}
        >
          {props?.snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </div>
  );
};

export default AlertPopup;
