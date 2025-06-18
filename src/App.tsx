import React from 'react';
import logo from './logo.svg';
import './App.css';
import FlowEditor from './components/layout/FlowEditor';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ReactDOM from 'react-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ReactFlowProvider } from 'reactflow'

const App: React.FC = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <ReactFlowProvider>
        <FlowEditor />
      </ReactFlowProvider>
      <ToastContainer
        position="top-center" // Vị trí hiển thị mặc định: trên cùng, giữa
        autoClose={3000}     // Tự động đóng sau 3 giây (3000ms)
        hideProgressBar={false} // Hiển thị thanh tiến trình
        newestOnTop={true}   // Toast mới nhất sẽ hiển thị ở trên cùng
        closeOnClick={true}  // Click vào toast sẽ đóng
        rtl={false}          // Hướng văn bản từ phải sang trái (false = từ trái sang phải)
        pauseOnFocusLoss={true} // Tạm dừng khi cửa sổ không được focus
        draggable={true}     // Cho phép kéo toast
        pauseOnHover={true}  // Tạm dừng tự động đóng khi hover
        theme="colored"      // Chủ đề màu sắc: 'light', 'dark', 'colored'
      // Bạn có thể thêm các style CSS tùy chỉnh nếu muốn thay đổi giao diện mặc định
      // toastClassName="my-custom-toast" // Class CSS cho từng toast
      // bodyClassName="my-custom-body"
      // progressClassName="my-custom-progress"
      />
    </DndProvider>
  );
}

export default App;
