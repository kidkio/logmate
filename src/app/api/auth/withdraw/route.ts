import { NextRequest, NextResponse } from 'next/server';
import { getUserBySession, deleteUser } from '@/lib/user-store';
import { failureStore } from '@/lib/storage';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('logmate_token')?.value || req.headers.get('authorization')?.replace('Bearer ', '');
    const body = await req.json().catch(() => ({}));
    const deviceId = body.deviceId;
    const isGuest = body.isGuest;
    const userId = body.userId;

    if (!token) {
      // 게스트 탈퇴 처리
      if (isGuest && userId) {
        await failureStore.deleteUserData(userId, deviceId);
        return NextResponse.json({ success: true, message: '게스트 기록이 모두 안전하게 삭제되었습니다.' });
      }
      return NextResponse.json({ success: false, error: '인증 정보가 없습니다.' }, { status: 401 });
    }

    const user = await getUserBySession(token);
    if (!user) {
      if (userId) {
        await failureStore.deleteUserData(userId, deviceId);
        return NextResponse.json({ success: true, message: '기록이 삭제되었습니다.' });
      }
      return NextResponse.json({ success: false, error: '유효하지 않은 계정입니다.' }, { status: 401 });
    }

    // 1. 작성 사연 및 온기 쪽지 영구 파기
    await failureStore.deleteUserData(user.id, deviceId);

    // 2. 회원 계정 및 세션 영구 삭제
    await deleteUser(user.id);

    // 3. 브라우저 인증 쿠키 제거
    const response = NextResponse.json({
      success: true,
      message: '회원 탈퇴가 완료되었습니다. 모든 개인정보와 작성 데이터가 안전하게 파기되었습니다.',
    });
    response.cookies.delete('logmate_token');

    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || '탈퇴 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
