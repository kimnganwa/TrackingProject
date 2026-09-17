import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
    getAllUsers, 
    getUserById, 
    createUser, 
    updateUser, 
    deleteUser 
} from '../controllers/usersControllers.js';
import User from '../models/User.js';

// Mock User model để cô lập logic của controller, tránh tác động trực tiếp đến cơ sở dữ liệu thực tế.
vi.mock('../models/User.js');

describe('Unit Test: usersControllers', () => {
    
    // Xóa bộ nhớ đệm của tất cả các mock function trước mỗi test case để đảm bảo tính độc lập.
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ---------------- GET /api/users/:id ----------------
    it('getUserById - Trả về chi tiết người dùng và HTTP status 200 khi truyền ID hợp lệ', async () => {
        // Khởi tạo đối tượng Request và Response giả lập (Mock object)
        const req = { params: { id: '123' } };
        const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
        
        // Mô phỏng dữ liệu hợp lệ được trả về từ tầng Model
        const mockUser = { _id: '123', full_name: 'Nguyen B' };
        User.findById.mockReturnValue({
            select: vi.fn().mockResolvedValue(mockUser)
        });

        await getUserById(req, res);

        // Xác thực kết quả đầu ra
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('getUserById - Trả về lỗi 404 (Not Found) khi ID không tồn tại trong hệ thống', async () => {
        const req = { params: { id: '123' } };
        const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
        
        // Mô phỏng trường hợp truy vấn cơ sở dữ liệu không có kết quả
        User.findById.mockReturnValue({
            select: vi.fn().mockResolvedValue(null)
        });

        await getUserById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    // ---------------- POST /api/users ----------------
    it('createUser - Tạo người dùng thành công (201) và không trả về trường password_hash', async () => {
        const req = { body: { email: 'test@gmail.com', password_hash: 'secret' } };
        const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

        // Giả lập đối tượng Document của Mongoose với phương thức toObject()
        const mockCreatedUser = {
            _id: '1',
            email: 'test@gmail.com',
            password_hash: 'secret',
            toObject: vi.fn().mockReturnValue({ _id: '1', email: 'test@gmail.com', password_hash: 'secret' })
        };
        User.create.mockResolvedValue(mockCreatedUser);

        await createUser(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        // Xác thực tính bảo mật: đảm bảo password_hash đã được loại bỏ khỏi response
        expect(res.json).toHaveBeenCalledWith({ _id: '1', email: 'test@gmail.com' });
    });

    // ---------------- PUT /api/users/:id ----------------
    it('updateUser - Trả về lỗi 403 (Forbidden) khi tài khoản User cố gắng cập nhật dữ liệu của người khác', async () => {
        // Giả lập payload với tài khoản người gọi API (User) khác với ID cần cập nhật
        const req = { 
            params: { id: '2' }, 
            user: { id: '1', role: 'User' },
            body: { full_name: 'Hacker' }
        };
        const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

        await updateUser(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: "Forbidden: You can only update your own profile" });
    });

    it('updateUser - Cập nhật thành công (200) khi tài khoản thực hiện có quyền Admin', async () => {
        const req = { 
            params: { id: '2' }, 
            user: { id: '99', role: 'Admin' }, // Quyền quản trị viên hợp lệ
            body: { full_name: 'Changed' }
        };
        const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

        const mockUser = {
            _id: '2',
            save: vi.fn().mockResolvedValue(true),
            toObject: vi.fn().mockReturnValue({ _id: '2', full_name: 'Changed' })
        };
        User.findById.mockResolvedValue(mockUser);

        await updateUser(req, res);

        expect(mockUser.save).toHaveBeenCalled(); // Xác thực phương thức lưu trữ đã được gọi
        expect(res.status).toHaveBeenCalledWith(200);
    });

    // ---------------- DELETE /api/users/:id ----------------
    it('deleteUser - Thực hiện xóa mềm (Soft Delete) thành công (200) bằng cách thay đổi trạng thái is_active', async () => {
        const req = { params: { id: '1' } };
        const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

        const mockUser = {
            _id: '1',
            is_active: true,
            save: vi.fn().mockResolvedValue(true)
        };
        User.findById.mockResolvedValue(mockUser);

        await deleteUser(req, res);

        // Kiểm tra logic nghiệp vụ: Trạng thái hoạt động phải được chuyển sang false
        expect(mockUser.is_active).toBe(false); 
        expect(mockUser.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });
});