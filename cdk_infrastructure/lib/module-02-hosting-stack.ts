import * as cdk from "aws-cdk-lib";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import * as path from "path";

const PROJECT_ROOT = path.resolve(__dirname, "../..");
const BACKEND_ROOT = path.resolve(PROJECT_ROOT, "backend_node");
const INFRA_ROOT = path.resolve(PROJECT_ROOT, "module_02_infra_node");
const POINT_SERVICE_HANDLERS_ROOT = path.resolve(BACKEND_ROOT, "point_service/handlers");

const DEFAULT_RUNTIME = cdk.aws_lambda.Runtime.NODEJS_24_X;
const DEFAULT_LAMBDA_TIMEOUT = cdk.Duration.seconds(10);

export class Module02HostingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const siteBucket = new s3.Bucket(this, "MapPointsSiteBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const distribution = new cloudfront.Distribution(this, "MapPointsDistribution", {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(siteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: "index.html",
      errorResponses: [
        { httpStatus: 403, responseHttpStatus: 200, responsePagePath: "/index.html" },
        { httpStatus: 404, responseHttpStatus: 200, responsePagePath: "/index.html" },
      ],
    });

    new s3deploy.BucketDeployment(this, "DeployFrontend", {
      sources: [s3deploy.Source.asset("../frontend/dist")],
      destinationBucket: siteBucket,
      distribution,
      distributionPaths: ["/*"],
    });

    const getPointsList = new NodejsFunction(this, "GetPointsList", {
      entry: path.join(POINT_SERVICE_HANDLERS_ROOT, "getPointsList.ts"),
      handler: "getPointsList",
      runtime: DEFAULT_RUNTIME,
      timeout: DEFAULT_LAMBDA_TIMEOUT,

      projectRoot: PROJECT_ROOT,
    });

    const getPointById = new NodejsFunction(this, "GetPointById", {
      entry: path.join(POINT_SERVICE_HANDLERS_ROOT, "getPointById.ts"),
      handler: "getPointById",
      runtime: DEFAULT_RUNTIME,
      timeout: DEFAULT_LAMBDA_TIMEOUT,

      projectRoot: PROJECT_ROOT,
    });

    const api = new apigateway.RestApi(this, "PointsApi", {
      deployOptions: {
        stageName: "dev",
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
      },
      restApiName: "Points Service API",
      description: "API for managing points in the GIS application",
    });

    const pointsResource = api.root.addResource("points");
    pointsResource.addMethod("GET", new apigateway.LambdaIntegration(getPointsList));

    const pointByIdResource = pointsResource.addResource("{id}");
    pointByIdResource.addMethod("GET", new apigateway.LambdaIntegration(getPointById));

    new cdk.CfnOutput(this, "ApiUrl", {
      value: api.url
    });

    new cdk.CfnOutput(this, "CloudFrontUrl", {
      value: `https://${distribution.distributionDomainName}`,
    });

    new cdk.CfnOutput(this, "BucketName", {
      value: siteBucket.bucketName,
    });
  }
}
