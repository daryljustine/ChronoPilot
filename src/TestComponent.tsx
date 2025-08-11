import React, { useState } from 'react';

function TestComponent() {
    console.log('React in TestComponent:', React);
    console.log('useState in TestComponent:', useState);
    
    const [count, setCount] = useState(0);
    
    return (
        <div>
            <h1>Test Component</h1>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>Increment</button>
        </div>
    );
}

export default TestComponent;
