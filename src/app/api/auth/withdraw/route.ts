import { NextRequest, NextResponse } from 'next/server';
import { getUserBySession, deleteUser } from '@/lib/user-store';
import { failureStore } from '@/lib/storage';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('logmate_token')?.value || req.headers.get('authorization')?.replace('Bearer ', '');
    const body = await req.json().catch(() => ({}));
    const deviceId = typeof body.deviceId === 'string' ? body.deviceId : undefined;
    const isGuest = Boolean(body.isGuest);

    // 1. 게스트 사용자 데이터 정리 요청인 경우 (토큰 없음)
    if (!token) {
      if (isGuest && deviceId) {
        // 게스트 데이터 삭제 시 userId는 전달하지 않으며, 오직 해당 기기의 순수 게스트 사연만 삭제
        await failureStore.deleteUserData(undefined, deviceId);
        return NextResponse.json({ success: true, message: '게스트 기록이 모두 안전하게 삭제되었습니다.' });
      }
      return NextResponse.json({ success: false, error: '인증 정보가 없습니다.' }, { status: 401 });
    }

    // 2. 회원 탈퇴: 반드시 세션 검증 후 해당 세션의 user.id만 삭제 (요청 본문의 userId는 완전 무시)
    const user = await getUserBySession(token);
    if (!user) {
      return NextResponse.json({ success: false, error: '유효하지 않은 계정 세션입니다.' }, { status: 401 });
    }

    // 작성 사연 및 온기 쪽지 영구 파기 (오직 본인 user.id 기준)
    await failureStore.deleteUserData(user.id, undefined);

    // 회원 계정 및 세션 영구 삭제
    await deleteUser(user.id);

    // 브라우저 인증 쿠키 제거
    const response = NextResponse.json({
      success: true,
      message: '회원 탈퇴가 완료되었습니다. 모든 개인정보와 작성 데이터가 안전하게 파기되었습니다.',
    });
    response.cookies.delete('logmate_token');

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : '탈퇴 처리 중 오류가 발생했습니다.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
