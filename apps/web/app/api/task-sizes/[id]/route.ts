import { ITaskSizesCreate } from '@app/interfaces';
import { authenticatedGuard } from '@app/services/server/guards/authenticated-guard-app';
import { deleteTaskSizesRequest, editTaskSizesRequest } from '@app/services/server/requests';
import { NextResponse } from 'next/server';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
	const res = new NextResponse();
	const { $res, user, access_token, tenantId } = await authenticatedGuard(req, res);

	if (!user) return $res('Unauthorized');

	const { id } = params;

	const datas = (await req.json()) as unknown as ITaskSizesCreate;

	const response = await editTaskSizesRequest({
		id,
		datas,
		bearer_token: access_token,
		tenantId
	});

	return $res(response.data);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
	const res = new NextResponse();
	const { $res, user, access_token, tenantId } = await authenticatedGuard(req, res);

	if (!user) return $res('Unauthorized');

	const { id } = params;

	const response = await deleteTaskSizesRequest({
		id,
		bearer_token: access_token,
		tenantId
	});

	return $res(response.data);
}
