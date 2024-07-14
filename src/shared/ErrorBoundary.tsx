import { Alert } from "@mui/material";
import { Component, ReactNode } from "react";

type Props = {
  children: ReactNode
}

type State = {
  hasError: boolean,
  errorMessage?: string
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: undefined,
  };

  public static getDerivedStateFromError(err: Error): State {
    return {
      hasError: true,
      errorMessage: `${err.name}: ${err.message}`
    };
  }

  public render() {
    if (this.state.hasError) {
      return (<>
        <Alert color="error">
          <div><strong>Oh no! We've hit an error.</strong></div>

          {this.state.errorMessage ?? <em>No additional information available</em>}
        </Alert>
      </>);
    }
    
    return this.props.children;
  }
}

export default ErrorBoundary;