import test from 'node:test';
import assert from 'node:assert';
import { getPointsList } from './getPointsList';
import { APIGatewayProxyEventV2 } from 'aws-lambda/trigger/api-gateway-proxy';

test('getPointsList - basic functionality', async (t) => {
  await t.test('should return points list when valid request is provided', async () => {
    const event = {} as unknown as APIGatewayProxyEventV2;

    const result = await getPointsList(event);

    assert.strictEqual(result.statusCode, 200);
    assert(result.body);
  });
});