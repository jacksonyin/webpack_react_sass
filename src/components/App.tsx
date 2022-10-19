import * as React from 'react';
import './App.scss';

export type IAppProps = Record<string, unknown>;

type IAppState = {
  value?: string;
};

export class App extends React.Component<IAppProps, IAppState> {
  constructor(props: IAppProps) {
    super(props);

    this.state = {
      value: '',
    };
  }

  handleChange = (event) => {
    const { value } = event.target;
    this.setState(() => ({ value }));
  };

  render() {
    const { value } = this.state;
    return (
      <>
        <div className="img-container">Test React</div>
        <input
          type="text"
          value={value}
          onChange={this.handleChange}
        />
      </>
    );
  }
}
