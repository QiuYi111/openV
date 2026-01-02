import MainLayout from './components/MainLayout'
import CodeEditor from './components/CodeEditor'

const SAMPLE_VERILOG = `module alu (
    input wire [7:0] a, b,
    input wire [2:0] opcode,
    output reg [7:0] result,
    output reg zero
);

    always @(*) begin
        case (opcode)
            3'b000: result = a + b; // ADD
            3'b001: result = a - b; // SUB
            default: result = 8'b0;
        endcase
        zero = (result == 8'b0);
    end

endmodule
`;

function App() {
  return (
    <MainLayout>
      <CodeEditor
        fileName="alu.v"
        language="verilog"
        code={SAMPLE_VERILOG}
        onChange={(val) => console.log('Code changed:', val)}
      />
    </MainLayout>
  )
}

export default App
