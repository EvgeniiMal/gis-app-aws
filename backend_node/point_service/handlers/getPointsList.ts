import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { mockPoints } from "../data/mock-points.js";

// TODO Module 3: return mock array of points
// TODO Module 4: replace with DynamoDB scan (join points + point_metadata tables)

export const getPointsList = async (
  _event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyStructuredResultV2> => {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(mockPoints),
  };
};
