import test from 'node:test';
import assert from 'node:assert';
import { getPointById } from './getPointById';
import { APIGatewayProxyEventV2 } from 'aws-lambda/trigger/api-gateway-proxy';
import { mockPoints } from '../data/mock-points';

test('getPointById - basic functionality', async (t) => {
  await t.test('should return point by ID when valid request is provided', async () => {
    const event = {
      pathParameters: {
        id: '3'
      }
    } as unknown as APIGatewayProxyEventV2;
    const mockData = mockPoints;
    const point = mockData.find(p => p.id === '3');

    const result = await getPointById(event);

    assert.strictEqual(result.statusCode, 200);
    assert(result.body);
    assert.deepStrictEqual(JSON.parse(result.body), point);
  });

  await t.test('should return 404 when point is not found', async () => {
    const event = {
      pathParameters: {
        id: '999'
      }
    } as unknown as APIGatewayProxyEventV2;

    const result = await getPointById(event);

    assert.strictEqual(result.statusCode, 404);
    assert(result.body);
  });

  await t.test('should handle missing path parameters', async () => {
    const event = {
      pathParameters: null
    } as unknown as APIGatewayProxyEventV2;

    const result = await getPointById(event);

    assert.strictEqual(result.statusCode, 400);
    assert(result.body);
  });
});