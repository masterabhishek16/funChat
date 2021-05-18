import React from "react";
import { Progress } from "semantic-ui-react";

const ProgressBar = ({ uploadState, barPercent }) =>
  uploadState && (
    <Progress
      className="progress__bar"
      percent={barPercent}
      progress
      indicating
      size="medium"
      inverted
    />
  );

export default ProgressBar;
