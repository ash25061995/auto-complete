import { ChangeEvent, useEffect, useState } from "react";
import { getUsersApiCall } from "../../api/users/usersApi";
import { useDebounce } from "../../hooks/useDebounce/useDebounce";
import generateHashKey from "../../utils/hashKey";
import { IConfig, memoizeAsync } from "../../utils/memoizeAsync/memoizeAsync";
import './searchBar.css';

interface ISearchBarProps {
    placeholderText?: string;
    setSuggestionList: (list: Array<any>) => void;
    selectedValue?: string;
}

//initialize the cache
const memoizeUsers = memoizeAsync();

const SearchBar = (props: ISearchBarProps) => {
    const [text, setText] = useState<string>('');
    const { placeholderText = 'Type to search...', setSuggestionList, selectedValue='' } = props;
    const debouncedText = useDebounce(text, 500);

    const fetchUsers = async () => {
        try {
            const hashKey = generateHashKey(['GET','USERS']);
            const config : IConfig = {key: hashKey, duration: 10000};
            memoizeUsers(getUsersApiCall, config, (response: any) => {
                const suggestionsList = !!text ? response?.data?.filter((suggestion: any) => suggestion.name.toLowerCase().includes(debouncedText.toLowerCase())) : [];
                if(suggestionsList.length) {
                    setSuggestionList(suggestionsList)
                }else{
                    setSuggestionList([])
                }
            })
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        if(!!debouncedText) {
            fetchUsers()
        }
    }, [debouncedText])

    useEffect(() => {
        if(!!selectedValue) {
            setText(selectedValue);
        }
    },[selectedValue])

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const inputValue = event.target.value;
        setText(inputValue);
    }

    return (
        <div className="input-wrapper">
            <input type='text' value={text} placeholder={placeholderText} onChange={handleInputChange}/>
        </div>
    )
}

export default SearchBar