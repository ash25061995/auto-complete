// import { memo } from "react";
import "./styles/SuggestionList.css";
import Suggestion from "./Suggestion";

interface ISuggestionListProps {
  data: Array<any>;
  setSelectedValue: (value: string) => void;
}

const SuggestionList = (props: ISuggestionListProps) => {
  const {data, setSelectedValue} = props;
  const updateSelectedValue = (value: string) => {
    setSelectedValue(value);
  }
  return (
    <div className="results-list">
      {!!data.length ? data.map((result, id) => {
        return <Suggestion setSelectedValue={updateSelectedValue} value={result.name} key={id} />;
      }) : null}
    </div>
  );
};

export default SuggestionList;