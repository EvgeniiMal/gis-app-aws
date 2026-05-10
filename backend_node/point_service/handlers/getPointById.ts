import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { sharedHeaders } from "../utils/shared-headers.js";
import { mockPoints } from "../data/mock-points.js";

export const getPointById = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyStructuredResultV2> => {
  const pointId = event.pathParameters?.id;
  if (!pointId) {
    return {
      statusCode: 400,
      headers: sharedHeaders,
      body: JSON.stringify({ message: "Missing /\"id\"/ in path parameters" }),
    };
  }

  const point = mockPoints.find((p) => p.id === pointId);
  if (!point) {
    return {
      statusCode: 404,
      headers: sharedHeaders,
      body: JSON.stringify({ message: "Point not found" }),
    };
  }

  return {
    statusCode: 200,
    headers: sharedHeaders,
    body: JSON.stringify(point),
  };
};
