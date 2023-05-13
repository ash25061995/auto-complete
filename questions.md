# 1. What is the difference between Component and PureComponent? Give an example where it might break my app.

~ Component : The Component class is the base class for creating React components. Upon extending Component, component will re-render whenever its state or props change, regardless of whether the new values are different from the previous ones. This means that even if you update a component with the same props and state, it will still trigger a re-rendering, reason being it implements the shouldComponentUpdate lifecycle method with a default behavior that always returns true. This means that every time there is a re-render, the component's render method will be called, regardless of whether the component's props or state have changed or not.

~ PureComponent : PureComponent is the extension of Component class that provides an optimized implementation of the shouldComponentUpdate method. It performs a shallow comparison of the component's props and state, and if there are no changes detected, it prevents the component from re-rendering. This behavior helps optimize performance by preventing unnecessary re-renders when the data remains the same.

 let's consider a scenario where using PureComponent might break your app:
 
 ```diff
+ class YourComponent extends PureComponent {
+  render() {
+    return (
+      <ul>
+        {this.props.items.map((item) => (
+          <li key={item.id}>{item.name}</li>
+       ))}
+      </ul>
+    );
+  }
+}
- In the above example, if the parent component modifies the array in place, like items.push(newItem) instead of creating a new array with the updated items, the PureComponent won't recognize the change because the reference to the original array remains the same. As a result, YourComponent won't re-render, and the UI won't update accordingly.
# text in gray
@@ text in purple (and bold)@@
```
~ Another case where PureComponent can break your app is if you have a component that uses a ref. The ref will not be updated if the component does not re-render. This can lead to unexpected behavior, such as the component not being able to access the DOM element it is associated with.

~ if you have a component that uses a timer, the timer will not be restarted if the component does not re-render. This can lead to unexpected behavior, such as the timer not firing or the component not updating its state correctly.

# 2. Context + ShouldComponentUpdate might be dangerous. Why is that?

The problem is that when you use shouldComponentUpdate() to prevent a component from re-rendering, it will also prevent the context from being updated. This can lead to unexpected behavior, such as components not displaying the latest data.

# 3. Describe 3 ways to pass information from a component to its PARENT.

1. Callback Function: We can pass callback function as props to the child component from parent to update/get value in the parent component.

let's consider this example:

const ParentComponent = () => {
    const [text, setText] = useState<string>('');
    const getValueFromChild = (data: any) => {
        setText(data);
    }

    //memoizing the getValueFromChild function to avoid unnecessary re-renders
    const memoizedCallback = useCallback(() => {
        getValueFromChild(data);
    },[])

    return (
        <>  
            <p>Data from Child3: {text}</p>
            <ChildComponent sendUpdatedValue={memoizedCallback}/>
        </>
    ) 
}

const ChildComponent = ({sendUpdatedValue}) => {
    const handleClick = () => {
        sendUpdatedValue('Hello from child');
    }
    return (
        <>
            <button onClick={handleClick}>
        </>
    )
}

2. Context Api: You can always use context api to efficiently pass information from child to parent that helps avoid prop drilling, meaning we have to pass props on each level to get to the target child component when using only props.

let's consider an example:

const MyContext = createContext(); //create context

const ParentComponent = () => {
  const [dataFromChild, setDataFromChild] = useState('');

  const handleChildData = (data) => {
    setDataFromChild(data);
  };

  return (
    <MyContext.Provider value={handleChildData}>
      <div>
        <h1>Parent Component</h1>
        <ChildComponent1>
            <ChildComponent2>
                <ChildComponent3/>
            <ChildComponent2>
        </ChildComponent1>
        <p>Data from Child3: {dataFromChild}</p>
      </div>
    </MyContext.Provider>
  );
};

const ChildComponent1 = () = {

    return (
        <ChildComponent2/>
    )
}

const ChildComponent2 = () = {

    return (
        <ChildComponent3/>
    )
}

//only ChildComponent3 is consuming the context of parent component it can easily send updated value to the parent component, it doesn't need to pass the data through intermediate components
const ChildComponent3 = () => {
  const handleData = useContext(MyContext);

  const sendDataToParent = () => {
    const data = 'Hello from the child component!';
    handleData(data);
  };

  return (
    <div>
      <h2>Child Component</h2>
      <button onClick={sendDataToParent}>Send Data to Parent</button>
    </div>
  );
};

3. forwardRef: React's forwardRef feature also enable us to pass data from child to parent.

let's consider an example:


function ParentComponent() {
  const childRef = useRef(null);

  // Function to be called from the child component
  const handleChildData = (data) => {
    console.log('Data from child:', data);
  };

  return (
    <div>
      <ChildComponent ref={childRef} onChildData={handleChildData} />
    </div>
  );
}

const ChildComponent = forwardRef((props, ref) => {
  // Function to be called when passing data to the parent
  const sendDataToParent = (e) => {
    const data = e.target.value;
    props.onChildData(data); // Call the parent's callback function with the data
  };

  // Pass the ref to the DOM element or another component
  // that you want to access from the parent
  return <input ref={ref} onChange={sendDataToParent} />;
});

# 4. Give 2 ways to prevent components from re-rendering.

1. React.memo: React.memo is higher order component which takes the component as it's first argument and callback that returns boolean for equality check as the second argument.

const MemoizedComponent = memo(SomeComponent, arePropsEqual);

It checks for the props changes (prevProps == nextProps), it does shallow comparison between prevProps and nextProps and determine whether to render the component depending upon props changes.

let's take an example:

const MyComponent = React.memo(({ name, age }) => {
  return (
    <div>
      <h1>{name}</h1>
      <p>{age}</p>
    </div>
  );
});

Another scenario where we have to re-render only when user id gets changed.

const MyComponent = React.memo(({ user }) => {
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.age}</p>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.user.id === nextProps.user.id;
});

2. Use of useMemo and useCallback to prevent unneccessary re-renders

    ~useMemo : Whenever you're expected to get the same value for same set of arguments for a function that is computationaly heavy o(n2), you should be using useMemo.

    const MyComponent = ({ data }) => {
    // Compute the expensive calculation only when 'data' changes
    const processedData = useMemo(() => {
        // Expensive computation or data transformation
        return expensiveCalculation(data);
    }, [data]);

    return (
        <div>
            <h1>Processed Data:</h1>
            <p>{processedData}</p>
        </div>
        );
    };

    By specifying [data] as the dependency array for useMemo, the hook will compare the previous data value with the new data value. If they are the same, it will return the cached value of processedData, preventing the expensive calculation from being executed again.

    ~useCallback: useCallback memoizes the function instead of value returned from the function so that on every re-render the function does not get re-created which can led to un-necessary re-rendering of child components.

    const MyComponent = () => {
    const [count, setCount] = useState(0);

    const increment = useCallback(() => {
        setCount(count + 1);
    }, []);

    return (
        <div>
            <button onClick={increment}>Increment</button>
            <h1>{count}</h1>
        </div>
        );
    };

    By passing an empty dependency array ([]) as the second argument to useCallback, we tell React that the increment function should only be created once during the initial render of MyComponent and remain the same for subsequent renders, as there are no dependencies that would require it to be re-created.

# 5. What is a fragment and why do we need it? Give an example where it might break my app.

 ~ React.Fragment: Fragment is the component that allows us to group together multiple elements without creating a node in the DOM tree which helps optimize rendering performance by reducing the number of DOM operations and memory usage.

 In the above code we could have used React.Fragment instead of div wrapper:

    const MyComponent = () => {
        const [count, setCount] = useState(0);

        const increment = useCallback(() => {
            setCount(count + 1);
        }, []);

        return (
            <React.Fragment>
                <button onClick={increment}>Increment</button>
                <h1>{count}</h1>
            </React.Fragment>
        );
    };

    It might break our application in the scenario where you are using Fragment and want to style them or trigger any events, as it doesn't create any node in DOM tree, no events and attributes are available except the property key. When you're mapping on a array and returning JSX you'll have the option to add key only.

    const MyComponent = () => (
        <>
            <h1>List of all items:</h1>
            {items.map(({ name, title }, index) => (
            <React.Fragment key={index}> // can't add styles and trigger events
                <p>{name}</p>
                <p>{title}</p>
            </React.Fragment>
            ))}
        </>
    );

# 6. Give 3 examples of the HOC pattern.

    Let's list out 3 examples of HOC:

    1. Suppose we have different lists across our app and we want to add search functionality to some of our list components, we can achieve this using HOC pattern.

    const withSearch = (WrappedComponent) => {
        
        return (props) => {
            const [text, setText] = useState('');
            const handleSearch = (e) => {
                const value = e.target.value;
                setText(value);
            }
            return (
                <>
                    <input type='text' onChange={handleSearch} value={text}/>
                    <WrappedComponent {...props} searchedItem={text}/>
                </>
            )
        }
    }

    2. Let's take another example where we have to log the information about components

    const withLogger = (WrappedComponent) => {

        return (props) => {
            useEffect(() => {
                 console.log(`Component ${WrappedComponent.name} mounted.`);

                return () => {
                    // Log component unmount
                    console.log(`Component ${WrappedComponent.name} unmounted.`);
                };
            },[])
            return (
                <WrappedComponent {...props}/>
            )
        }
    }

    3. Let's take an example where we have to handle errors

    const errorBoundary = (WrappedComponent) => {
        return (props) => {
            try {
                return <WrappedComponent {...props} />;
            } catch (error) {
                console.error(error);
                return <h1>An error occurred</h1>;
            }
        };
    };

    const MyComponent = ({ message }) => {
        throw new Error("This is an error");
    };

    const ErrorBoundaryMyComponent = errorBoundary(MyComponent);

    <ErrorBoundaryMyComponent message="Hello World!" />;

# 7. What's the difference in handling exceptions in promises, callbacks and async...await?

    1. Promises: Promises uses catch block to handle exceptions.

    example: 

        somePromiseFunction()
        .then((result) => {
            // Handle the fulfilled promise
        })
        .catch((error) => {
            // Handle the rejected promise or any exception within the chain
        });

    2. Callbacks: Callback functions traditionally rely on an error-first callback pattern. The error is passed as the first argument to the callback function.

    example: 

        someCallbackFunction((error, result) => {
            if (error) {
                // Handle the error
            } else {
                // Handle the result
            }
        });

    3. Async/Await: It uses try catch block to handle result and exception respectively.

    example:

        async function someAsyncFunction() {
            try {
                const result = await somePromiseFunction();
                // Handle the result
            } catch (error) {
                // Handle the exception
            }
        }

# 8. How many arguments does setState take and why is it async.

~ setState takes object or a callback function : setState({name: 'aaa'}) or setState(({name}) => ({name: 'bbb'})), setState updates the component's internal state. It's an asynchronous operation thats batched, meaning multiple setState are batched before re-rendering the component with new value.

# 9. List the steps needed to migrate a Class to Function Component.


~ Here are the steps needed to migrate a Class to Function Component:

    1. Remove the class keyword.
    2. Remove the constructor.
    3. Remove the render method.
    4. Convert all class methods to functions.
    5. Remove all references to this.
    6. Use useState to manage state.
    7. Use useEffect to handle side effects.

    Here is an example:

    class MyComponent extends React.Component {
        state = {
            count: 0
        };

        incrementCounter = () => {
            this.setState(({counr}) => ({count: count+ 1}))
        };

        render() {
            return (
            <div>
                <button onClick={this.incrementCounter}>+</button>
                <h1>{this.state.count}</h1>
            </div>
            );
        }
    }

    const MyComponent = () => {
        const [count, setCount] = useState(0);

        const incrementCounter = () => {
            setCount((prevCount) => prevCount+1) ;
        };

        return (
            <>
                <button onClick={incrementCounter}></button>
                <h1>{count}</h1>
            </>
        );
    };

# 10. List a few ways styles can be used with components.

~ Here are a few ways styles can be used with components:

    1. Inline styles: Inline styles are the simplest way to style a component. They are defined directly in the component's markup, using the style attribute.

    <div style="background-color: yellow;">This is a yellow div.</div>

    2.  External stylesheets: External stylesheets are a more organized way to style a component. They are stored in separate files, and can be imported into the component using the import keyword.

    import './styles.css';

    const MyComponent = () => {
        return (
            <div>This is a styled div.</div>
        );
    };

    3. CSS modules: CSS modules are a way to scope styles to a specific component. They are created by using the @css-module pragma.

    @css-module 'my-component' {
        .my-component {
            background-color: yellow;
        }
    }

    const MyComponent = () => {
        return (
            <div class="my-component">This is a yellow div.</div>
        );
    };

    4. Styled components: Styled components are a React library that makes it easy to create and style components. They are created using the styled function.

    const MyComponent = styled.div`
        color: yellow;
    `;

    const MyComponent = () => {
        return (
            <MyComponent>This is a yellow div.</MyComponent>
        );
    };

# 11. How to render an HTML string coming from the server.

 ~ We can use dangerouslySetInnerHTML along with domPurify library to sanitize the html string recieved from the server to prevent any potential security vulnerabilities, such as cross-site scripting (XSS) attacks.

    const MyComponent = ({ htmlString }) => {
        const sanitizedHTML = DOMPurify.sanitize(htmlString);

        return <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />;
    };

~ We can also use react-html-parser library to parse the server sent html string.

    const MyComponent = () => {
        const htmlString = `
            <h1>This is a heading</h1>
            <p>This is a paragraph</p>
        `;

        const element = ReactHtmlParser.parse(htmlString);

        return (
            <div>{element}</div>
        );
    };